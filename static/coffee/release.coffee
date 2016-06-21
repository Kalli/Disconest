# Backbone model and view for a Discogs release
ReleaseModel = Backbone.Model.extend({
    url: () ->
        "/discogs?url=https://api.discogs.com/"+@attributes.type+"/"+@id

    initialize: () ->
        @on('sync', @.doSpotifySearch)
        @attributes.songs = []
    
    doSpotifySearch: () ->
        url = "https://api.spotify.com/v1/search"
        url = url + "?q=album:"+escape(@attributes.title)
        url = url + "%20artist:"+escape(@attributes.artistDisplayName)
        url = url + "&type=album"
        $.ajax
            url: url
            success: (response) => 
                @handleSpotifySeachResponse(response)

    handleSpotifySeachResponse: (response) ->
        if response.albums.items.length > 0
            @getSpotifyAlbum(response.albums.items[0].href)

    getSpotifyAlbum: (spotifyAlbumUrl) ->
        $.ajax
            url: spotifyAlbumUrl
            success: (response) => 
                @handleSpotifyAlbumResponse(response)

    handleSpotifyAlbumResponse: (response) ->
        @parseTracks(response.tracks.items)
        @getSpotifyAudioFeatures()

    getSpotifyAudioFeatures: () ->
        ids =   _.chain(@attributes.tracklist)
                .filter(((track) -> return track.spotifyId))
                .reduce(((ids, track) -> return ids + track.spotifyId + ","), "")
                .value()
        $.ajax
            url: "spotifyAudioFeatures?ids="+ids
            success: (response) => 
                @handleSpotifyAudioFeaturesResponse(response)

    handleSpotifyAudioFeaturesResponse: (response) ->
        for audio_feature in response.audio_features
            for songModel in @attributes.songs
                songModel.handleSpotifyAudioData(audio_feature)
        @.trigger("spotifyDataLoaded")

    parseTracks: (spotifyTracks) ->
        for spotifyTrack in spotifyTracks
            for songModel in @attributes.songs
                songModel.handleSpotifyTrackData(spotifyTrack)

    parse: (response) ->
        response.artistDisplayName = @createArtistDisplayName(response.artists)
        for track in response.tracklist
            songModel = new SongModel(track)
            if !track.artists
                songModel.attributes.artists = response.artists
                songModel.attributes.artistDisplayName = response.artistDisplayName
            else
                songModel.attributes.artistDisplayName = @createArtistDisplayName(track.artists)
            @.attributes.songs.push(songModel)
        if response.videos
            for video in response.videos
                for songModel in @.attributes.songs
                    if video.description.toLowerCase().indexOf(songModel.attributes.title.toLowerCase()) != -1 && !songModel.attributes.video
                        songModel.attributes.video = video.uri
        response.styles = [] if not response.styles?
        response.genres = [] if not response.genres?
        response.banner = _.sample([
            {
                link: "http://www.junodownload.com/plus/2010/06/11/10-best-dj-headphones/?ref=bbis"
                img: "https://affiliate.juno.co.uk/accounts/default1/banners/b2189b79.gif" 
                alt: "10 Best: DJ Headphones 2013" 
            },{
                link: "http://www.junodownload.com/plus/2010/09/21/10-best-dj-mixers-2/?ref=bbis"
                img: "https://affiliate.juno.co.uk/accounts/default1/banners/1d1ac0e1.gif" 
                alt: "10 Best: DJ Mixers" 
            },{
                link: "http://www.junodownload.com/plus/2011/05/03/10-best-audio-interfaces-for-home-studios/?ref=bbis"
                img: "https://affiliate.juno.co.uk/accounts/default1/banners/f7470cb1.gif" 
                alt: "10 Best: Audio Interfaces" 
            },{
                link: "http://www.junodownload.com/plus/2011/05/03/10-best-audio-interfaces-for-home-studios/?ref=bbis"
                img: "https://affiliate.juno.co.uk/accounts/default1/banners/f7470cb1.gif" 
                alt: "10 Best: Audio Interfaces" 
            },{
                link: "http://www.juno.co.uk/promotions/DJ_Equipment_Deals/?ref=bbis"
                img: "https://affiliate.juno.co.uk/accounts/default1/banners/ef6086b3.gif" 
                alt: "DJ Equipment deals"
            }
        ])
        return response

    createArtistDisplayName: (artists) ->
        artistDisplayName = ""
        for artist, index in artists
            artist.name = artist.name.replace(/\s\(\d+\)/,"")
            if artist.anv
                artistDisplayName += artist.anv
            else
                artistDisplayName += artist.name
            if index+1 < artists.length
                if artist.join == ","
                    artistDisplayName += ", "
                else
                    artistDisplayName += " "+artist.join+" "
        return artistDisplayName

    createJunoLinks: () ->
        searchprefix = "http://www.juno.co.uk/search/?q"
        @attributes.junolabellink = ""
        if @attributes.labels
            @attributes.junolabellink = '<a target="_blank" href="'
            @attributes.junolabellink += searchprefix+"%5Blabel%5D%5B%5D="
            @attributes.junolabellink += encodeURIComponent(@attributes.labels[0].name)+'&ref=bbis">'
            @attributes.junolabellink += 'Releases on '+@attributes.labels[0].name+'</a>'
        @attributes.junoartistlink = ""
        @attributes.junolink = ""
        if @attributes.artists
            @attributes.junolink = searchprefix+"%5Bartist%5D%5B%5D="+encodeURIComponent(@attributes.artistDisplayName)+'&ref=bbis'
            @attributes.junoartistlink = '<a target="_blank" href="'
            @attributes.junoartistlink += @attributes.junolink 
            @attributes.junoartistlink += '">Releases by '+ @attributes.artistDisplayName 
            @attributes.junoartistlink += '</a>'
})

ReleaseView = Backbone.View.extend({
    events:
        # "click #scrobble": "scrobble"
        "click #print": "print"
    print : () ->
        window.print()
      
    scrobble: () ->
        if @model.attributes.lastfmtoken
            scrobbledata = @createScrobbleData()
            $.ajax
                url: '/scrobble'
                type: 'post'
                data: scrobbledata
                error: (jqXHR, textStatus, errorThrown) ->
                    $("#scrobbleerror strong").html("Scrobbling failed. Sorry about that!")
                    $("#scrobbleerror").show()
                    $('.alert .close').click (e) ->
                        $(@).parent().hide()

                success: (data, textStatus, jqXHR) ->
                    $("#scrobblesuccess strong").html("Scrobbled "+data.tracks+" tracks to the "+data.user+" Last.fm account")
                    $("#scrobblesuccess").show()
                    $('.alert .close').click (e) ->
                        $(@).parent().hide()
        else
            open("http://www.last.fm/api/auth/?api_key="+@model.attributes.lastfm_apikey+"&cb="+document.URL, '_self')

    createScrobbleData: () ->
        tracks = []
        timestamp = Math.round(new Date().getTime()/1000)
        for track, index in @model.attributes.tracklist
            tracklistlength = @model.attributes.tracklist.length
            if track.title 
                artistname = ""
                artists = if track.artists then track.artists else @model.attributes.artists
                for artist, index in artists
                    artistname += artist.name
                    if index+1 < artists.length
                        if artist.join = ","
                            artistname += ", "
                        else
                            artistname += " "+artist.join+" "
                scrobbletrack =
                    artist: artistname
                    track: track.title
                    timestamp: String(timestamp-(300*(tracklistlength-index)))
                tracks.push(scrobbletrack)
        scrobbledata = 
            tracks: tracks
            token: @model.attributes.lastfmtoken
        return scrobbledata

    tagName: 'div'
    id: 'release'
    template: window["JST"]["releaseTemplate.html"];
    render: () ->
        $('#'+@id).html(@template(@model.toJSON()))
        for songModel in @model.attributes.songs
            songView = new SongView(model: songModel)
            songView.render()
        return @
})
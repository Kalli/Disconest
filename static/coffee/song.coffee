# Backbone model and view for a track on a release, fetches Echonest information for the track
SongModel = Backbone.Model.extend({
    url: () ->
        url = 'http://developer.echonest.com/api/v4/song/search?api_key=BB7QVYHAMYUOT4ESL&format=json&results=1&artist_id=discogs:artist:'+@id+'&title='+escape(@attributes.title)
        buckets = '&bucket=audio_summary&bucket=tracks&bucket=id:deezer&bucket=id:spotify-WW'
        url += buckets
        return url
    })
SongView = Backbone.View.extend({
    render: () ->
        if @model.attributes.response.songs and @model.attributes.response.songs.length > 0
            song = @model.attributes.response.songs[0]
            if song.audio_summary
                minutes = String(Math.floor(song.audio_summary.duration / 60))
                seconds = String(Math.floor(song.audio_summary.duration % 60))
                if seconds.length == 1
                    seconds += "0"
                $('#tltable tbody tr').eq(@model.attributes.index).find(".duration").text(minutes+":"+seconds)
                html = '<td class="center">'+song.audio_summary.key+'</td>'
                html += '<td class="center">'+song.audio_summary.time_signature+'</td>'
                html += '<td class="center">'+song.audio_summary.tempo+'</td>'
            @addStreamingLinks(song, @model.attributes.index)
        else
            html = '<td></td><td></td><td></td>'
        $('#tltable tbody tr').eq(@model.attributes.index).append(html)

    addStreamingLinks: (song, index) ->
        # add streaming links if present
        if song.tracks
            spotify = false
            deezer = false
           for track in song.tracks
                if track.catalog == "spotify-WW" and not spotify
                    url = "http://open.spotify.com/track/"+track.foreign_id.split("spotify-WW:track:")[1]
                    link = $('<a>').attr('href',url).attr('target', '_blank').addClass("sp").text("Spotify")
                    spotify = true
                if track.catalog == "deezer" and not deezer
                    url = "http://www.deezer.com/track/"+track.foreign_id.split("deezer:track:")[1]
                    link = $('<a>').attr('href',url).attr('target', '_blank').addClass("de").text("Deezer")
                    deezer = true
                    $('#tltable tbody tr').eq(@model.attributes.index).find('.link').append(link)
                $('#tltable tbody tr').eq(@model.attributes.index).find('.link').append(link)
})


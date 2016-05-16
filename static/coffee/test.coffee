describe 'The release model', () ->
    type = 'releases'
    id = 2281630
    releaseModel = new ReleaseModel({type: type, id: id})

    beforeEach () ->
        spyOn($, "ajax").and.callFake (params) ->
            if /discogs/.test(params.url)
                params.success(discogsResponse)
            if /api.spotify.com\/v1\/search/.test(params.url)
                params.success(spotifySearchResponse)
            if /api.spotify.com\/v1\/albums/.test(params.url)
                params.success(spotifyAlbumResponse)
            if /spotifyAudioFeatures/.test(params.url)
                params.success(spotifyAudioSummaryResponse)
        releaseModel.fetch()

    it 'Correctly creates a release model', () ->
        expect(releaseModel.id).toEqual(id)
        expect(releaseModel.attributes.type).toEqual(type)

    it 'Correctly makes ajax calls for Discogs information', () ->
        expect($.ajax).toHaveBeenCalledWith(
            jasmine.objectContaining(
                url: '/discogs?url=https://api.discogs.com/'+type+'/'+id
            )
        )
    
    it 'Correctly stores Discogs information in the model', () ->
        expect(releaseModel.attributes.artists).toEqual(discogsResponse.artists)
        expect(releaseModel.attributes.tracklist).toEqual(discogsResponse.tracklist)

    it 'Correctly makes ajax calls for Spotify information', () ->
        url = "https://api.spotify.com/v1/search"
        url = url + "?q=album:"+escape(releaseModel.attributes.title)
        url = url + "%20artist:"+escape(releaseModel.attributes.artistDisplayName)
        url = url + "&type=album"
        # album search
        expect($.ajax).toHaveBeenCalledWith(
            jasmine.objectContaining(
                url: url
            )
        )
        # album info
        expect($.ajax).toHaveBeenCalledWith(
            jasmine.objectContaining(
                url: spotifySearchResponse.albums.items[0].href
            )
        )
        # audio features info
        ids =   _.chain(releaseModel.attributes.tracklist)
                .filter(((track) -> return track.spotifyId))
                .reduce(((ids, track) -> return ids + track.spotifyId + ","), "")
                .value()
        url = "spotifyAudioFeatures?ids="+ids
        expect($.ajax).toHaveBeenCalledWith(
            jasmine.objectContaining(
                url: url
            )
        )

    it 'Correctly handles Spotify information', () ->
        expect(releaseModel.attributes.tracklist[0].tempo).toEqual(130)
        expect(releaseModel.attributes.tracklist[0].key).toEqual(1)
        expect(releaseModel.attributes.tracklist[0].mode).toEqual(1)


lastfmresponse = {"user":"user"}
describe 'Scrobbling model', () ->
    type = 'releases'
    id = 2281630
    token = "mocktoken"
    releaseModel = new ReleaseModel({type: type, id: id, lastfmtoken: token})

    releaseView = new ReleaseView({model:releaseModel, el: $('body')})

    beforeEach () ->
        spyOn($, "ajax").and.callFake (params) ->
            if /discogs/.test(params.url)
                params.success(discogsResponse)
            if /scrobble/.test(params.url)
                params.success(lastfmresponse)

    it 'Makes the correct ajax calls when scrobbling', () ->
        releaseModel.fetch()
        releaseView.scrobble()
        expect($.ajax).toHaveBeenCalledWith(
            jasmine.objectContaining(
                url: '/scrobble'
            )
        )

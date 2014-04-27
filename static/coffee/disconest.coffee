$(document).ready ->
    ValidateDiscogsUrl = (url) ->
        discogsparams = {}
        regexp = /(?:https?:\/\/)?(?:www.)?discogs.com\/.*?\/?(release|master)\/(\d+)/
        matches = url.match(regexp)
        if matches and matches.length == 3
            discogsparams.valid = true
            discogsparams.type = matches[1]+"s"
            discogsparams.id = matches[2]
        else
            discogsparams.valid = false
        return discogsparams

    $('#discogsurl').keypress((e)=>
        if e.which == 13
            getMetaData()
    )

    $('#getmetadata').click(()=>
        getMetaData()
    )

    getMetaData = () ->
        url = $('#discogsurl').val()
        regexp = /(?:https?:\/\/)?(?:www.)?discogs.com\/.*?\/(release|master)\/(\d+)/
        matches = url.match(regexp)
        discogsparams = ValidateDiscogsUrl(url)
        if discogsparams.valid
            releaseModel = new ReleaseModel({type: discogsparams.type, id: discogsparams.id})
            releaseModel.fetch(
                success: () ->
                    releaseView = new ReleaseView({model:releaseModel})
                    releaseView.render()
                    for track, index in releaseModel.attributes.tracklist
                        if !track.artists
                            track.artists = releaseModel.attributes.artists
                        if track.artists[0].id != 194 #194 is the dreaded various
                            ( ->
                                songModel = new SongModel({id: track.artists[0].id, index: index, title: track.title})
                                songModel.fetch(
                                    success: () ->
                                        songView = new SongView({model: songModel})
                                        songView.render()
                                )
                            )()
                        else 
                            html = '<td></td><td></td><td></td>'
                            $('#tltable tbody tr').eq(index).append(html)
            )
        else
            renderError(url)

    renderError = (url) ->
        $("#error").show()
        $('.alert .close').click (e) ->
            $(@).parent().hide()

    params = document.URL.split("?")
    if params.length > 1
        params = params[1].split("&")
        for param in params
            kv = param.split("=")
            if kv.length == 2 and kv[0] =="discogsurl"
                discogsparams = ValidateDiscogsUrl(kv[1])
                if discogsparams.valid
                    $('#discogsurl').val(kv[1])
                    getMetaData()

$(document).ready ->
    releaseModel = new ReleaseModel()
    releaseView = new ReleaseView({model:releaseModel, el: $('body')})
    getParams = () ->
        query = window.location.search.substring(1)
        raw_vars = query.split("&")
        params = {}
        for v in raw_vars
            [key, val] = v.split("=")
            params[key] = decodeURIComponent(val)
        return params
    urlparams = getParams()

    ValidateDiscogsUrl = (url) ->
        discogsparams = {}
        regexp = /(?:https?:\/\/)?(?:www.)?discogs.com\/.*?\/?(release|master)s?\/(\d+)/
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
            releaseparameters = 
                type: discogsparams.type
                id: discogsparams.id
                lastfm_apikey: "608dd6c15b85a6abcd794f1b01c0438e"
            if urlparams.token
                releaseparameters.lastfmtoken = urlparams.token
            releaseModel = new ReleaseModel(releaseparameters)
            releaseModel.fetch(
                success: () ->
                    title = "Disconest - Musical metadata for "+releaseModel.attributes.title
                    window.history.pushState(null, title, location.protocol+"//"+location.host+"/?discogsurl="+$('#discogsurl').val())
                    document.title = title
                    releaseView.undelegateEvents()
                    releaseView = new ReleaseView({model:releaseModel, el: $('body')})
                    releaseView.render()
                    for track, index in releaseModel.attributes.tracklist
                        if track.artists[0].id != 194 #194 is the dreaded various
                            ( ->
                                if track.artists.length > 1
                                    songModel = new SongModel({artists: track.artists, index: index, title: track.title})
                                else
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
        $("#error strong").html(url + " is not a valid Discogs URL")
        $("#error").show()
        $('.alert .close').click (e) ->
            $(@).parent().hide()

    if urlparams.discogsurl
        url = unescape(urlparams.discogsurl)
        discogsparams = ValidateDiscogsUrl(url)
        if discogsparams.valid
            $('#discogsurl').val(url)
            getMetaData()            



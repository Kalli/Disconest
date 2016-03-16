$(document).ready ->
    releaseModel = new ReleaseModel()
    releaseView = new ReleaseView({model:releaseModel, el: $('body')})
    searchCollection = new SearchCollection({})
    searchCollectionView = new SearchCollectionView({collection:searchCollection, el: $('body')})
    if urlparams.discogsurl
        url = unescape(urlparams.discogsurl)
        discogsparams = ValidateDiscogsUrl(url)
        if discogsparams.valid
            $('#searchbox').val(url)
            getMetaData(discogsparams)

    $('#searchbox').keypress((e)=>
        if e.which == 13
            search()
        else
            $('#results').hide(1000)
    )

    $('#searchbutton').click(()=>
        search()
    )

    search = () ->
        query = $('#searchbox').val()
        discogsparams = ValidateDiscogsUrl(query)
        if discogsparams.valid
            getMetaData(discogsparams)
        else
            $('#results').html("")
            $(".error").hide()
            $(".loading").show()
            searchCollectionView.undelegateEvents()
            searchCollection = new SearchCollection({"query" : query})
            searchCollection.fetch(
                success: () ->
                    $(".loading").hide()
                    $(".error").hide()
                    searchCollectionView = new SearchCollectionView({collection:searchCollection, el: $('#results')})
                    searchCollectionView.render()
                error: () -> 
                    $('.loading').hide() 
                    $('.error').show() 
                )
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
    regexp = /(?:https?:\/\/)?(?:www.)?discogs.com\/.*?\/?(release|master)s?\/(?:view\/)?(\d+)/
    matches = url.match(regexp)
    if matches and matches.length == 3
        discogsparams.valid = true
        discogsparams.type = matches[1]+"s"
        discogsparams.id = matches[2]
    else
        discogsparams.valid = false
    return discogsparams

getMetaData = (discogsparams) ->
    $(".error").hide()
    $(".loading").show()
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
            discogsurl = "https://www.discogs.com/"+releaseModel.attributes.type.slice(0, -1)+"/"+releaseModel.id
            window.history.pushState(null, title, location.protocol+"//"+location.host+"/?discogsurl="+discogsurl)
            document.title = title
            releaseModel.createJunoLinks()
            releaseView = new ReleaseView({model:releaseModel, el: $('body')})
            releaseView.render()
            $(".loading").hide()
            $(".error").hide()
            $('#release').show()
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
        error: () ->
            $('.loading').hide() 
            $('.error').show() 
    )
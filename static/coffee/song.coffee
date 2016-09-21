SongModel = Backbone.Model.extend(
    initialize: () ->
        @attributes.keys = ['C', 'C#', 'D', 'E♭', 'E', 'F', 'F#', 'G', 'A♭', 'A', 'B♭', 'B']
        @attributes.modes = ['Minor','Major']

    handleSpotifyTrackData: (spotifyTrack) ->
        if !@attributes.spotifyId and @sameTrack(spotifyTrack)
            @attributes.spotifyId = spotifyTrack.id
            @attributes.previewUrl = spotifyTrack.preview_url
            if @.attributes.duration == ""
                minutes = String(Math.floor((spotifyTrack.duration_ms / 1000) / 60))
                seconds = String(Math.floor((spotifyTrack.duration_ms / 1000) % 60))
                if seconds.length == 1
                    seconds += "0"
                @attributes.duration = minutes+":"+seconds

    handleSpotifyAudioData: (audio_feature) ->
        if audio_feature != null && @attributes.spotifyId == audio_feature.id
            if audio_feature.tempo
                audio_feature.tempo = +audio_feature.tempo.toFixed(1)
            _.extend(@attributes, audio_feature)

    sameTrack: (spotifyTrack, discogsTrack) ->
        spotifyName = spotifyTrack.name.toLowerCase().replace("(", "").replace(")", "")
        discogsName = @attributes.title.toLowerCase().replace("(", "").replace(")", "")
        name = spotifyName.indexOf(discogsName) != -1 || discogsName.indexOf(spotifyName) != -1
        # todo add more heuristics
        # string diff titles
        # compare track position
        # compare track length
        # return a confidence value?
        return name
)

SongView = Backbone.View.extend({
    tagName: "tr",
    id: 'songs'
    template: window["JST"]["songTemplate.html"]
    events:
        "click .edit": "edit"

    editing: false

    edit : () ->
        @editing = !@editing
        for td in @$el.find('td')
            if $(td).hasClass('editable')
                $(td).attr('contenteditable', @editing)

        span = @$el.find('.edit span')
        if @editing
            span.addClass('glyphicon-ok').removeClass('glyphicon-pencil')
        else
            span.removeClass('glyphicon-ok').addClass('glyphicon-pencil')


    render: () ->
        @$el.html(@template(@model.toJSON()))
        return @
})

SongCollection = Backbone.Collection.extend(
    model = SongModel
    tagName: 'div'

)

SongCollectionView = Backbone.View.extend(
    template: window["JST"]["songCollectionTemplate.html"]

    render: () ->
        @$el.html(@template({}))
        for songModel in @collection.models
            songView = new SongView(model: songModel)
            songView.render()
            @$el.find('tbody').append(songView.el)
)
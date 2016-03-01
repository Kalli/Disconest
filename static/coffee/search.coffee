# Backbone model and view for a Discogs search
SearchResultModel = Backbone.Model.extend({})
SearchResultView = Backbone.View.extend({
    tagName: "li"
    attributes:
        tabindex: -1
    initialize: () ->
        @render()
    render: () ->
        this.$el.html(@template(this.model.toJSON()));

    template: _.template("""
        <a href="">
            <img width="50" height="50" src="<%= thumb %>" />
            <%= title %>
        </a>
    """)
    events:
        "click": "release"
    release: (e) ->
        e.preventDefault()
        $('#release').hide()
        $('#results').hide(1000)
        parameters = 
            id: this.model.attributes.id
            type: this.model.attributes.type + "s"
        getMetaData(parameters)
})

SearchCollection = Backbone.Collection.extend({
    tag: "div"
    model: SearchResultModel
    initialize: (props) ->
        @url = "/discogs?url=https://api.discogs.com/database/search?q="+props.query+"&type=master"
        return
    parse: (response) ->
        releases = []
        for result in response.results
            if result.type == "release" or result.type == "master"
                releases.push(result)
        response.results = releases
        return response.results   
})

SearchCollectionView = Backbone.View.extend({
    events:
        "click .showmore" : "showmore"
        "keydown .showmore" : "showmore"

    showmore: (e) ->
        e.preventDefault()
        if e.which == 13 or e.which == 1
            hidden = $(".hidden")
            for release, index in hidden
                if index < 10
                    $(release).show()
                    $(release).removeClass("hidden")

    tagName: 'div'
    id: 'results'
    template: _.template("""
        <ul id="searchCollection" class="col-md-12 dropdown-menu" role="menu" tabindex="1" aria-labelledby="searchform">
        </ul>
    """)
    render: () ->
        # <li role="separator" class="divider <% if (i > 4){%> hidden<% }%>"></li>
        $('#'+@id).html(@template({}))
        @collection.each( (searchResultModel, index) =>
            searchResultView = new SearchResultView ({model: searchResultModel})
            if show = index > 4
                searchResultView.$el.addClass("hidden")
            @.$el.find("#searchCollection").append(searchResultView.$el);
        )
        if @collection.length > 4
            @.$el.find("#searchCollection").append('<li class="divider"></li>')
            @.$el.find("#searchCollection").append('<li><a class="showmore" href="">Show more</a></li>')
        $('#'+@id).show()
        return @
})
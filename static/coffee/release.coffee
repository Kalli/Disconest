# Backbone model and view for a Discogs release
ReleaseModel = Backbone.Model.extend({
    url: () ->
        "/discogs?url=http://api.discogs.com/"+@attributes.type+"/"+@id

    parse: (response) ->
        for artist in response.artists
            artist.name = artist.name.replace(/\s\(\d+\)/,"")
        for track in response.tracklist
            if !track.artists
                track.artists = response.artists
            else
                for artist in track.artists
                    artist.name = artist.name.replace(/\s\(\d+\)/,"")
        return response
})

ReleaseView = Backbone.View.extend({
    events:
        "click #scrobble": "scrobble"
      
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
                for artist in artists
                    artistname += artist.name+artist.join
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
    template: _.template("""
        <div class="row">
          <div class="col-xs-2 img">
          <a target="_blank" href="<%=uri%>">
            <img src="/pixogs?img=<%=images[0]["uri150"]%>">
          </a>
          </div>
          <div class="release col-xs-8">
            <h1><a target="_blank" href="<%= uri %>">
                <% _.each(artists, function(artist){ %>
                    <%= artist.name %> <%= artist.join %>
                <% }); %>
                - <%= title%>
            </a></h1>
            <table class="table">
            <tr>
              <td>
              Genres &amp; styles:
              </td>
              <td>
                  <% _.each(styles, function(style) { %> 
                      <span class="badge"><%= style %></span>
                  <% }); %>
                  <% _.each(genres, function(genre) { %> 
                      <span class="badge"><%= genre %></span>
                  <% }); %>
              </td>
            </tr>
            <tr>
                <td>Year:</td><td><%= year %></td>
            <tr>
            <% if (typeof(labels) !== "undefined"){ %> 
                <tr>
                    <td>Cat. no / Label:</td>
                    <td>
                    <% _.each(labels, function(label) { %> 
                        <%= label.catno %>  / <%= label.name %>
                    <% }); %>
                    </td>
                </tr>
            <% }; %>
            </table>
            <div class="social">
            <a id="scrobble" type="button" class="btn btn-danger">
                <span class="scrobble icon-lastfm2"> </span>
                Scrobble to Last.fm
            </a>
            <a class="btn btn-info" href="http://twitter.com/intent/tweet?hashtags=Disconest&url=http%3A//www.disconest.com/%3Fdiscogsurl%3Dhttp%253A//www.discogs.com/<%= type %>/<%= id %>" target="_blank">
                <span class="icon-twitter2"></span>
                Tweet
            </a>
            <a class="btn btn-primary" href="https://www.facebook.com/sharer/sharer.php?u=http://www.disconest.com/?discogsurl=http://www.discogs.com/<%= type %>/<%= id %>" target="_blank">
                <span id="fb" class="icon-facebook2"> </span>
                Share on Facebook
            </a>
            <div id="scrobbleerror" class="alert alert-danger alert-dismissable fade in" style="display:none;">
              <button type="button" class="close" aria-hidden="true">&times;</button>
              <strong>Error scrobbling. Sorry about that!</strong>
            </div>
            <div id="scrobblesuccess" class="alert alert-success alert-dismissable fade in" style="display:none;">
              <button type="button" class="close" aria-hidden="true">&times;</button>
              <strong>Success!</strong>
            </div>
            </div>
          </div>
        </div>
        <div id="tracklist" class="row">
            <h3>Tracklist</h3>
            <table id="tltable" class="table">
            <thead>
            <% _.each(["Position", "Duration", "Artist", "Title", "Links"], function(heading) { %> 
                <td class="<%=heading %>" ><%=heading %></td> 
            <% }); %>
            <% _.each(["Key", "TS", "BPM"], function(heading) { %> 
                <td class="<%=heading %> center"><%=heading %></td> 
            <% }); %>
            </thead>
            <tbody>
            <% _.each(tracklist, function(track) { %> 
                <tr>
                    <td><%= track.position %></td>
                    <td class="duration"><%= track.duration %></td>
                    <td>
                    <% if (track.artists) { %>
                        <% _.each(track.artists, function(artist){ %>
                            <%= artist.name %> <%= artist.join %>
                        <% }); %>
                    <% } %>
                    </td>
                    <td ><%= track.title %> </td>
                    <td class="link">
                        <% if (track.video) { %>
                           <a href="<%= track.video %> target="_blank" class="yt">Youtube</a>
                        <% }; %>
                    </td>
                </tr>
            <% }); %>
            </tbody>
            </table>
        </div>
        """)
    render: () ->
        @addVideoLinks()
        $('#'+@id).html(@template(@model.toJSON()))
        return @

    addVideoLinks: () ->
      if @model.attributes.videos
        for video in @model.attributes.videos
          for track, index in @model.attributes.tracklist
            if video.description.toLowerCase().indexOf(track.title.toLowerCase()) != -1 && !track.video
                track.video = video.uri
    })
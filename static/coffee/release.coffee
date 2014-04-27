# Backbone model and view for a Discogs release
ReleaseModel = Backbone.Model.extend({
    url: () ->
        "/discogs?url=http://api.discogs.com/"+@attributes.type+"/"+@id
    })
ReleaseView = Backbone.View.extend({
    tagName: 'div'
    id: 'release'
    template: _.template("""
        <div class="row">
          <div class="col-xs-2">
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
            <td>Year</td><td><%= year %></td>
            </tr>
            </table>
          </div>
        </div>
        <div id="tracklist" class="row">
            <h3>Tracklist</h3>
            <table id="tltable" class="table">
            <thead>
            <% _.each(["Position", "Duration", "Artist", "Title", "Links"], function(heading) { %> 
                <td><%=heading %></td> 
            <% }); %>
            <% _.each(["Key", "Time signature", "BPM"], function(heading) { %> 
                <td class="center"><%=heading %></td> 
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
                    <td class="link"></td>
                </tr>
            <% }); %>
            </tbody>
            </table>
        </div>
        """)
    render: () ->
        $("#release").html(@template(@model.toJSON()))
        @addVideoLinks()

    addVideoLinks: () ->
      if @model.attributes.videos
        for video in @model.attributes.videos
          for track, index in @model.attributes.tracklist
            if video.description.toLowerCase().indexOf(track.title.toLowerCase()) != -1
              link = $('<a>').attr('href',video.uri).attr('target', '_blank').addClass("yt").text("Youtube")
              $('#tltable tbody').find('tr').eq(index).find('.link').append(link)
    })

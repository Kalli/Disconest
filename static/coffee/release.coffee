# Backbone model and view for a Discogs release
ReleaseModel = Backbone.Model.extend({
    url: () ->
        "/discogs?url=https://api.discogs.com/"+@attributes.type+"/"+@id

    parse: (response) ->
        for artist in response.artists
            artist.name = artist.name.replace(/\s\(\d+\)/,"")
        for track in response.tracklist
            if !track.artists
                track.artists = response.artists
            else
                for artist in track.artists
                    artist.name = artist.name.replace(/\s\(\d+\)/,"")
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
            artists = ""
            for artist, index in @attributes.artists
                artists += artist.name
                if index+1 < @attributes.artists.length
                    if artist.join = ","
                        artists += ", "
                    else
                        artists += " "+artist.join+" "
            @attributes.junolink = searchprefix+"%5Bartist%5D%5B%5D="+encodeURIComponent(artists)+'&ref=bbis'
            @attributes.junoartistlink = '<a target="_blank" href="'
            @attributes.junoartistlink += @attributes.junolink 
            @attributes.junoartistlink += '">Releases by '+ artists 
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
    template: _.template("""
        <div class="row">
          <div class="col-xs-2 img">
          <a target="_blank" href="<%=uri%>">
          <% if (typeof(images) !== "undefined"){ %>   
            <img src="<%=images[0]["uri150"]%>">
          <% }else{ %>
            <img src="/img/rekid-150.png">
          <% }; %>
          </a>
          </div>
          <div class="release col-xs-8">
            <h1><a target="_blank" href="<%= uri %>">
                <% _.each(artists, function(artist, index){ %>
                    <%= artist.name %>
                    <% if (index+1 < artists.length){ %>   
                        <%= artist.join %>
                    <% } %>
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
            </div>
            <div class="social release col-xs-10">
            <a id="print" type="button" class="btn btn-default">
                <span class="print icon-printer"> </span>
                Print one sheet
            </a>
            <div class="btn-group">
                <a href="<%= junolink %>" target="_blank" class="btn juno">
                    <span class="icon-radio-checked2"></span>
                    Buy records on Juno
                </a>
                <button type="button" class="btn juno dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    <span class="caret"></span>
                    <span class="sr-only">Toggle Dropdown</span>
                </button>
                <ul class="dropdown-menu">
                    <% if (junoartistlink !== ""){ %> 
                        <li>
                            <%= junoartistlink %>
                        </li>
                    <% }; %>
                    <% if (junolabellink !== ""){ %> 
                        <li>
                            <%= junolabellink %>
                        </li>
                    <% }; %>
                </ul>
            </div>
            <!--
            Scrobbling disable while last.fm api is buggy
            <a id="scrobble" type="button" class="btn btn-danger">
                  <span class="scrobble icon-lastfm2"> </span>
                 Scrobble to Last.fm
            </a>
            -->
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
                        <% _.each(track.artists, function(artist, index){ %>
                            <%= artist.name %> 
                            <% if (index+1 < track.artists.length) { %>
                                <%= artist.join %>
                            <% } %>
                        <% }); %>
                    <% } %>
                    </td>
                    <td ><%= track.title %> </td>
                    <td class="link">
                        <% if (track.video) { %>
                           <a href="<%= track.video %>" target="_blank" class="yt">Youtube</a>
                        <% }; %>
                    </td>
                </tr>
            <% }); %>
            </tbody>
            </table>
        </div>
        <div class="row banner">
            <div class="text-center" >
                <a href="<%= banner.link %>" target="_blank">
                    <img src="<%= banner.img %>" alt="<%= banner.alt %>" title="<%= banner.alt %>" width="234" height="60" />
                </a>
            </div>
          </div>
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
// Generated by CoffeeScript 1.7.1
var ReleaseModel, ReleaseView;

ReleaseModel = Backbone.Model.extend({
  url: function() {
    return "/discogs?url=http://api.discogs.com/" + this.attributes.type + "/" + this.id;
  },
  parse: function(response) {
    var artist, track, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2;
    _ref = response.artists;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      artist = _ref[_i];
      artist.name = artist.name.replace(/\s\(\d+\)/, "");
    }
    _ref1 = response.tracklist;
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      track = _ref1[_j];
      if (!track.artists) {
        track.artists = response.artists;
      } else {
        _ref2 = track.artists;
        for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
          artist = _ref2[_k];
          artist.name = artist.name.replace(/\s\(\d+\)/, "");
        }
      }
    }
    return response;
  }
});

ReleaseView = Backbone.View.extend({
  events: {
    "click #scrobble": "scrobble"
  },
  scrobble: function() {
    var scrobbledata;
    if (this.model.attributes.lastfmtoken) {
      scrobbledata = this.createScrobbleData();
      return $.ajax({
        url: '/scrobble',
        type: 'post',
        data: scrobbledata,
        error: function(jqXHR, textStatus, errorThrown) {
          $("#scrobbleerror strong").html("Scrobbling failed. Sorry about that!");
          $("#scrobbleerror").show();
          return $('.alert .close').click(function(e) {
            return $(this).parent().hide();
          });
        },
        success: function(data, textStatus, jqXHR) {
          $("#scrobblesuccess strong").html("Scrobbled " + data.tracks + " tracks to the " + data.user + " Last.fm account");
          $("#scrobblesuccess").show();
          return $('.alert .close').click(function(e) {
            return $(this).parent().hide();
          });
        }
      });
    } else {
      return open("http://www.last.fm/api/auth/?api_key=" + this.model.attributes.lastfm_apikey + "&cb=" + document.URL, '_self');
    }
  },
  createScrobbleData: function() {
    var artist, artistname, artists, index, scrobbledata, scrobbletrack, timestamp, track, tracklistlength, tracks, _i, _j, _len, _len1, _ref;
    tracks = [];
    timestamp = Math.round(new Date().getTime() / 1000);
    _ref = this.model.attributes.tracklist;
    for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
      track = _ref[index];
      tracklistlength = this.model.attributes.tracklist.length;
      if (track.title) {
        artistname = "";
        artists = track.artists ? track.artists : this.model.attributes.artists;
        for (_j = 0, _len1 = artists.length; _j < _len1; _j++) {
          artist = artists[_j];
          artistname += artist.name + artist.join;
        }
        scrobbletrack = {
          artist: artistname,
          track: track.title,
          timestamp: String(timestamp - (300 * (tracklistlength - index)))
        };
        tracks.push(scrobbletrack);
      }
    }
    scrobbledata = {
      tracks: tracks,
      token: this.model.attributes.lastfmtoken
    };
    return scrobbledata;
  },
  tagName: 'div',
  id: 'release',
  template: _.template("<div class=\"row\">\n  <div class=\"col-xs-2 img\">\n  <a target=\"_blank\" href=\"<%=uri%>\">\n    <img src=\"/pixogs?img=<%=images[0][\"uri150\"]%>\">\n  </a>\n  </div>\n  <div class=\"release col-xs-8\">\n    <h1><a target=\"_blank\" href=\"<%= uri %>\">\n        <% _.each(artists, function(artist){ %>\n            <%= artist.name %> <%= artist.join %>\n        <% }); %>\n        - <%= title%>\n    </a></h1>\n    <table class=\"table\">\n    <tr>\n      <td>\n      Genres &amp; styles:\n      </td>\n      <td>\n          <% _.each(styles, function(style) { %> \n              <span class=\"badge\"><%= style %></span>\n          <% }); %>\n          <% _.each(genres, function(genre) { %> \n              <span class=\"badge\"><%= genre %></span>\n          <% }); %>\n      </td>\n    </tr>\n    <tr>\n        <td>Year:</td><td><%= year %></td>\n    <tr>\n    <% if (typeof(labels) !== \"undefined\"){ %> \n        <tr>\n            <td>Cat. no / Label:</td>\n            <td>\n            <% _.each(labels, function(label) { %> \n                <%= label.catno %>  / <%= label.name %>\n            <% }); %>\n            </td>\n        </tr>\n    <% }; %>\n    </table>\n    <div class=\"social\">\n    <a id=\"scrobble\" type=\"button\" class=\"btn btn-danger\">\n        <span class=\"scrobble icon-lastfm2\"> </span>\n        Scrobble to Last.fm\n    </a>\n    <a class=\"btn btn-info\" href=\"http://twitter.com/intent/tweet?hashtags=Disconest&url=http%3A//www.disconest.com/%3Fdiscogsurl%3Dhttp%253A//www.discogs.com/<%= type %>/<%= id %>\" target=\"_blank\">\n        <span class=\"icon-twitter2\"></span>\n        Tweet\n    </a>\n    <a class=\"btn btn-primary\" href=\"https://www.facebook.com/sharer/sharer.php?u=http://www.disconest.com/?discogsurl=http://www.discogs.com/<%= type %>/<%= id %>\" target=\"_blank\">\n        <span id=\"fb\" class=\"icon-facebook2\"> </span>\n        Share on Facebook\n    </a>\n    <div id=\"scrobbleerror\" class=\"alert alert-danger alert-dismissable fade in\" style=\"display:none;\">\n      <button type=\"button\" class=\"close\" aria-hidden=\"true\">&times;</button>\n      <strong>Error scrobbling. Sorry about that!</strong>\n    </div>\n    <div id=\"scrobblesuccess\" class=\"alert alert-success alert-dismissable fade in\" style=\"display:none;\">\n      <button type=\"button\" class=\"close\" aria-hidden=\"true\">&times;</button>\n      <strong>Success!</strong>\n    </div>\n    </div>\n  </div>\n</div>\n<div id=\"tracklist\" class=\"row\">\n    <h3>Tracklist</h3>\n    <table id=\"tltable\" class=\"table\">\n    <thead>\n    <% _.each([\"Position\", \"Duration\", \"Artist\", \"Title\", \"Links\"], function(heading) { %> \n        <td class=\"<%=heading %>\" ><%=heading %></td> \n    <% }); %>\n    <% _.each([\"Key\", \"TS\", \"BPM\"], function(heading) { %> \n        <td class=\"<%=heading %> center\"><%=heading %></td> \n    <% }); %>\n    </thead>\n    <tbody>\n    <% _.each(tracklist, function(track) { %> \n        <tr>\n            <td><%= track.position %></td>\n            <td class=\"duration\"><%= track.duration %></td>\n            <td>\n            <% if (track.artists) { %>\n                <% _.each(track.artists, function(artist){ %>\n                    <%= artist.name %> <%= artist.join %>\n                <% }); %>\n            <% } %>\n            </td>\n            <td ><%= track.title %> </td>\n            <td class=\"link\">\n                <% if (track.video) { %>\n                   <a href=\"<%= track.video %> target=\"_blank\" class=\"yt\">Youtube</a>\n                <% }; %>\n            </td>\n        </tr>\n    <% }); %>\n    </tbody>\n    </table>\n</div>"),
  render: function() {
    this.addVideoLinks();
    $('#' + this.id).html(this.template(this.model.toJSON()));
    return this;
  },
  addVideoLinks: function() {
    var index, track, video, _i, _len, _ref, _results;
    if (this.model.attributes.videos) {
      _ref = this.model.attributes.videos;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        video = _ref[_i];
        _results.push((function() {
          var _j, _len1, _ref1, _results1;
          _ref1 = this.model.attributes.tracklist;
          _results1 = [];
          for (index = _j = 0, _len1 = _ref1.length; _j < _len1; index = ++_j) {
            track = _ref1[index];
            if (video.description.toLowerCase().indexOf(track.title.toLowerCase()) !== -1 && !track.video) {
              _results1.push(track.video = video.uri);
            } else {
              _results1.push(void 0);
            }
          }
          return _results1;
        }).call(this));
      }
      return _results;
    }
  }
});

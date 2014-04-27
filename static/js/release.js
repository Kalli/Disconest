// Generated by CoffeeScript 1.7.1
var ReleaseModel, ReleaseView;

ReleaseModel = Backbone.Model.extend({
  url: function() {
    return "/discogs?url=http://api.discogs.com/" + this.attributes.type + "/" + this.id;
  }
});

ReleaseView = Backbone.View.extend({
  tagName: 'div',
  id: 'release',
  template: _.template("<div class=\"row\">\n  <div class=\"col-xs-2\">\n  <a target=\"_blank\" href=\"<%=uri%>\">\n    <img src=\"/pixogs?img=<%=images[0][\"uri150\"]%>\">\n  </a>\n  </div>\n  <div class=\"release col-xs-8\">\n    <h1><a target=\"_blank\" href=\"<%= uri %>\">\n        <% _.each(artists, function(artist){ %>\n            <%= artist.name %> <%= artist.join %>\n        <% }); %>\n        - <%= title%>\n    </a></h1>\n    <table class=\"table\">\n    <tr>\n      <td>\n      Genres &amp; styles:\n      </td>\n      <td>\n          <% _.each(styles, function(style) { %> \n              <span class=\"badge\"><%= style %></span>\n          <% }); %>\n          <% _.each(genres, function(genre) { %> \n              <span class=\"badge\"><%= genre %></span>\n          <% }); %>\n      </td>\n    </tr>\n    <tr>\n    <td>Year</td><td><%= year %></td>\n    </tr>\n    </table>\n  </div>\n</div>\n<div id=\"tracklist\" class=\"row\">\n    <h3>Tracklist</h3>\n    <table id=\"tltable\" class=\"table\">\n    <thead>\n    <% _.each([\"Position\", \"Duration\", \"Artist\", \"Title\", \"Links\"], function(heading) { %> \n        <td><%=heading %></td> \n    <% }); %>\n    <% _.each([\"Key\", \"Time signature\", \"BPM\"], function(heading) { %> \n        <td class=\"center\"><%=heading %></td> \n    <% }); %>\n    </thead>\n    <tbody>\n    <% _.each(tracklist, function(track) { %> \n        <tr>\n            <td><%= track.position %></td>\n            <td class=\"duration\"><%= track.duration %></td>\n            <td>\n            <% if (track.artists) { %>\n                <% _.each(track.artists, function(artist){ %>\n                    <%= artist.name %> <%= artist.join %>\n                <% }); %>\n            <% } %>\n            </td>\n            <td ><%= track.title %> </td>\n            <td class=\"link\"></td>\n        </tr>\n    <% }); %>\n    </tbody>\n    </table>\n</div>"),
  render: function() {
    $("#release").html(this.template(this.model.toJSON()));
    return this.addVideoLinks();
  },
  addVideoLinks: function() {
    var index, link, track, video, _i, _len, _ref, _results;
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
            if (video.description.toLowerCase().indexOf(track.title.toLowerCase()) !== -1) {
              link = $('<a>').attr('href', video.uri).attr('target', '_blank').addClass("yt").text("Youtube");
              _results1.push($('#tltable tbody').find('tr').eq(index).find('.link').append(link));
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

// Generated by CoffeeScript 1.7.1
var SongModel, SongView;

SongModel = Backbone.Model.extend({
  url: function() {
    var buckets, url;
    url = 'http://developer.echonest.com/api/v4/song/search?api_key=BB7QVYHAMYUOT4ESL&format=json&results=1&artist_id=discogs:artist:' + this.id + '&title=' + escape(this.attributes.title);
    buckets = '&bucket=audio_summary&bucket=tracks&bucket=id:deezer&bucket=id:spotify-WW';
    url += buckets;
    return url;
  }
});

SongView = Backbone.View.extend({
  render: function() {
    var html, minutes, seconds, song;
    if (this.model.attributes.response.songs && this.model.attributes.response.songs.length > 0) {
      song = this.model.attributes.response.songs[0];
      if (song.audio_summary) {
        minutes = String(Math.floor(song.audio_summary.duration / 60));
        seconds = String(Math.floor(song.audio_summary.duration % 60));
        if (seconds.length === 1) {
          seconds += "0";
        }
        $('#tltable tbody tr').eq(this.model.attributes.index).find(".duration").text(minutes + ":" + seconds);
        html = '<td class="center">' + song.audio_summary.key + '</td>';
        html += '<td class="center">' + song.audio_summary.time_signature + '</td>';
        html += '<td class="center">' + song.audio_summary.tempo + '</td>';
      }
      this.addStreamingLinks(song, this.model.attributes.index);
    } else {
      html = '<td></td><td></td><td></td>';
    }
    return $('#tltable tbody tr').eq(this.model.attributes.index).append(html);
  },
  addStreamingLinks: function(song, index) {
    var deezer, link, spotify, track, url, _i, _len, _ref, _results;
    if (song.tracks) {
      spotify = false;
      deezer = false;
    }
    _ref = song.tracks;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      track = _ref[_i];
      if (track.catalog === "spotify-WW" && !spotify) {
        url = "http://open.spotify.com/track/" + track.foreign_id.split("spotify-WW:track:")[1];
        link = $('<a>').attr('href', url).attr('target', '_blank').addClass("sp").text("Spotify");
        spotify = true;
      }
      if (track.catalog === "deezer" && !deezer) {
        url = "http://www.deezer.com/track/" + track.foreign_id.split("deezer:track:")[1];
        link = $('<a>').attr('href', url).attr('target', '_blank').addClass("de").text("Deezer");
        deezer = true;
        $('#tltable tbody tr').eq(this.model.attributes.index).find('.link').append(link);
      }
      _results.push($('#tltable tbody tr').eq(this.model.attributes.index).find('.link').append(link));
    }
    return _results;
  }
});

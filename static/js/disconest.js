// Generated by CoffeeScript 1.6.3
(function() {
  var Disconest;

  Disconest = (function() {
    function Disconest(discogsid, discogstype) {
      this.discogsid = discogsid;
      this.discogstype = discogstype;
      this.getDiscogsInformation(this.discogsid, this.discogstype);
      this.tldomelement = "#tltable";
    }

    Disconest.prototype.getDiscogsInformation = function(id, type) {
      var url,
        _this = this;
      url = "/discogs?url=http://api.discogs.com/" + type + "/" + id;
      return $.ajax({
        dataType: "json",
        url: url,
        data: [],
        success: function(response) {
          return _this.discogsCallback(response);
        }
      });
    };

    Disconest.prototype.discogsCallback = function(response) {
      this.discogsinfo = response;
      this.renderDiscogsInformation(response);
      this.getTracklist();
      return this.updateHistory();
    };

    Disconest.prototype.renderDiscogsInformation = function() {
      var html, source, template;
      source = $("#release-template").html();
      template = Handlebars.compile(source);
      html = template(this.discogsinfo);
      $("#release").html(html);
      return this.addVideoLinks();
    };

    Disconest.prototype.updateHistory = function() {
      var url;
      url = 'http://www.discogs.com/' + this.discogstype.substring(0, this.discogstype.length - 1) + "/" + this.discogsid;
      return window.history.pushState({
        "discogsid": this.discogsid,
        "discogstype": this.discogstype
      }, "Disconest Data for " + this.discogsinfo.title, "?discogsurl=" + url);
    };

    Disconest.prototype.addVideoLinks = function() {
      var index, link, track, video, _i, _len, _ref, _results;
      if (this.discogsinfo.videos) {
        _ref = this.discogsinfo.videos;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          video = _ref[_i];
          _results.push((function() {
            var _j, _len1, _ref1, _results1;
            _ref1 = this.discogsinfo.tracklist;
            _results1 = [];
            for (index = _j = 0, _len1 = _ref1.length; _j < _len1; index = ++_j) {
              track = _ref1[index];
              if (video.description.toLowerCase().indexOf(track.title.toLowerCase()) !== -1) {
                link = $('<a>').attr('href', video.uri).attr('target', '_blank').addClass("yt").text("Youtube");
                _results1.push($(this.tldomelement + ' tbody').find('tr').eq(index).find('.link').append(link));
              } else {
                _results1.push(void 0);
              }
            }
            return _results1;
          }).call(this));
        }
        return _results;
      }
    };

    Disconest.prototype.getTracklist = function(tltable) {
      var _this = this;
      return $(this.tldomelement + ' tbody').find('tr').each(function(index, element) {
        return _this.getEchonestInformation(index, $(element).data());
      });
    };

    Disconest.prototype.getEchonestInformation = function(index, data) {
      var buckets, url,
        _this = this;
      url = 'http://developer.echonest.com/api/v4/song/search?api_key=BB7QVYHAMYUOT4ESL&format=json&results=1&artist_id=discogs:artist:' + data.artistid + '&title=' + data.title;
      buckets = '&bucket=audio_summary&bucket=tracks&bucket=id:deezer&bucket=id:spotify-WW';
      url += buckets;
      return $.ajax({
        dataType: "json",
        url: url,
        data: [],
        success: function(response) {
          return _this.echonestCallback(index, response.response);
        }
      });
    };

    Disconest.prototype.echonestCallback = function(index, response) {
      var audio_summary, html, minutes, seconds;
      this.discogsinfo.tracklist[index].echonestinfo = response.songs[0];
      if (response.songs.length > 0) {
        audio_summary = response.songs[0].audio_summary;
        if (audio_summary) {
          minutes = String(Math.floor(audio_summary.duration / 60));
          seconds = String(Math.floor(audio_summary.duration % 60));
          if (seconds.length === 1) {
            seconds += "0";
          }
          $('#tltable tbody tr').eq(index).find(".duration").text(minutes + ":" + seconds);
          html = "";
          html += '<td class="center">' + audio_summary.key + '</td>';
          html += '<td class="center">' + audio_summary.time_signature + '</td>';
          html += '<td class="center">' + audio_summary.tempo + '</td>';
          this.addStreamingLinks(index);
        }
      } else {
        html = '<td></td><td></td><td></td>';
      }
      return $('#tltable tbody tr').eq(index).append(html);
    };

    Disconest.prototype.addStreamingLinks = function(index) {
      var de, link, sp, track, url, _i, _len, _ref, _results;
      sp = false;
      de = false;
      _ref = this.discogsinfo.tracklist[index].echonestinfo.tracks;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        track = _ref[_i];
        if (track.catalog === "spotify-WW" && !sp) {
          url = "http://open.spotify.com/track/" + track.foreign_id.split("spotify-WW:track:")[1];
          link = $('<a>').attr('href', url).attr('target', '_blank').addClass("sp").text("Spotify");
          sp = true;
          $(this.tldomelement + ' tbody').find('tr').eq(index).find('.link').append(link);
        }
        if (track.catalog === "deezer" && !de) {
          url = "http://www.deezer.com/track/" + track.foreign_id.split("deezer:track:")[1];
          link = $('<a>').attr('href', url).attr('target', '_blank').addClass("de").text("Deezer");
          de = true;
          _results.push($(this.tldomelement + ' tbody').find('tr').eq(index).find('.link').append(link));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    Handlebars.registerHelper('tracklist', function(tracks, artists, videos, options) {
      var artist, h, header, out, track, trackartist, trackartistid, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _m, _ref, _ref1, _ref2;
      out = "<h3>Tracklist</h3>";
      out += '<table id="tltable" class="table">';
      header = '<thead>';
      _ref = ['Position', 'Duration', 'Artist', 'Title', 'Links'];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        h = _ref[_i];
        header += '<td>' + h + '</td>';
      }
      _ref1 = ['Key', 'Time signature', 'BPM'];
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        h = _ref1[_j];
        header += '<td class="center">' + h + '</td>';
      }
      out += header + '</thead>';
      for (_k = 0, _len2 = tracks.length; _k < _len2; _k++) {
        track = tracks[_k];
        trackartist = '';
        trackartistid = '';
        if (track.artists) {
          _ref2 = track.artists;
          for (_l = 0, _len3 = _ref2.length; _l < _len3; _l++) {
            artist = _ref2[_l];
            trackartist = artist.name + artist.join;
            trackartistid = artist.id;
          }
        } else {
          for (_m = 0, _len4 = artists.length; _m < _len4; _m++) {
            artist = artists[_m];
            trackartist = artist.name + artist.join;
            trackartistid = artist.id;
          }
        }
        out += '<tr data-artistid="' + trackartistid + '" data-title="' + track.title + '">';
        out += '<td>' + track.position + '</td>';
        out += '<td class="duration">' + track.duration + '</td>';
        out += '<td >' + trackartist + '</td>';
        out += '<td >' + track.title + '</td>';
        out += '<td class="link"></td>';
        out += '</tr>';
      }
      out += '</table>';
      return out;
    });

    return Disconest;

  })();

  $(document).ready(function() {
    var ValidateDiscogsUrl, discogsparams, disconest, kv, param, params, renderError, _i, _len, _results,
      _this = this;
    ValidateDiscogsUrl = function(url) {
      var discogsparams, matches, regexp;
      discogsparams = {};
      regexp = /(?:https?:\/\/)?(?:www.)?discogs.com\/.*?\/?(release|master)\/(\d+)/;
      matches = url.match(regexp);
      if (matches && matches.length === 3) {
        discogsparams.valid = true;
        discogsparams.type = matches[1] + "s";
        discogsparams.id = matches[2];
      } else {
        discogsparams.valid = false;
      }
      return discogsparams;
    };
    $('#getmetadata').click(function() {
      var discogsparams, disconest, matches, regexp, url;
      url = $('#discogsurl').val();
      regexp = /(?:https?:\/\/)?(?:www.)?discogs.com\/.*?\/(release|master)\/(\d+)/;
      matches = url.match(regexp);
      discogsparams = ValidateDiscogsUrl(url);
      if (discogsparams.valid) {
        return disconest = new Disconest(discogsparams.id, discogsparams.type);
      } else {
        return renderError(url);
      }
    });
    renderError = function(url) {
      var html, source, template;
      source = $("#error-template").html();
      template = Handlebars.compile(source);
      html = template({
        "url": url,
        "error": " is not a valid Discogs release url!"
      });
      return $("#error").html(html);
    };
    params = document.URL.split("?");
    if (params.length > 1) {
      params = params[1].split("&");
      _results = [];
      for (_i = 0, _len = params.length; _i < _len; _i++) {
        param = params[_i];
        kv = param.split("=");
        if (kv.length === 2 && kv[0] === "discogsurl") {
          discogsparams = ValidateDiscogsUrl(kv[1]);
          if (discogsparams.valid) {
            _results.push(disconest = new Disconest(discogsparams.id, discogsparams.type));
          } else {
            _results.push(void 0);
          }
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    }
  });

  window.onpopstate = function(e) {
    var disconest;
    if (e.state && e.state.discogsid && e.state.discogstype) {
      return disconest = new Disconest(e.state.discogsid, e.state.discogstype);
    }
  };

}).call(this);

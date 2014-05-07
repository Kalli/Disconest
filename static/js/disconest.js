// Generated by CoffeeScript 1.7.1
$(document).ready(function() {
  var ValidateDiscogsUrl, discogsparams, getMetaData, getParams, releaseModel, releaseView, renderError, url, urlparams;
  releaseModel = new ReleaseModel();
  releaseView = new ReleaseView({
    model: releaseModel,
    el: $('body')
  });
  getParams = function() {
    var key, params, query, raw_vars, v, val, _i, _len, _ref;
    query = window.location.search.substring(1);
    raw_vars = query.split("&");
    params = {};
    for (_i = 0, _len = raw_vars.length; _i < _len; _i++) {
      v = raw_vars[_i];
      _ref = v.split("="), key = _ref[0], val = _ref[1];
      params[key] = decodeURIComponent(val);
    }
    return params;
  };
  urlparams = getParams();
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
  $('#discogsurl').keypress((function(_this) {
    return function(e) {
      if (e.which === 13) {
        return getMetaData();
      }
    };
  })(this));
  $('#getmetadata').click((function(_this) {
    return function() {
      return getMetaData();
    };
  })(this));
  getMetaData = function() {
    var discogsparams, matches, regexp, releaseparameters, url;
    url = $('#discogsurl').val();
    regexp = /(?:https?:\/\/)?(?:www.)?discogs.com\/.*?\/(release|master)\/(\d+)/;
    matches = url.match(regexp);
    discogsparams = ValidateDiscogsUrl(url);
    if (discogsparams.valid) {
      releaseparameters = {
        type: discogsparams.type,
        id: discogsparams.id,
        lastfm_apikey: "608dd6c15b85a6abcd794f1b01c0438e"
      };
      if (urlparams.token) {
        releaseparameters.lastfmtoken = urlparams.token;
      }
      releaseModel = new ReleaseModel(releaseparameters);
      return releaseModel.fetch({
        success: function() {
          var html, index, title, track, _i, _len, _ref, _results;
          title = "Disconest - Musical metadata for " + releaseModel.attributes.title;
          window.history.pushState(null, title, location.protocol + "//" + location.host + "/?discogsurl=" + $('#discogsurl').val());
          document.title = title;
          releaseView.undelegateEvents();
          releaseView = new ReleaseView({
            model: releaseModel,
            el: $('body')
          });
          releaseView.render();
          _ref = releaseModel.attributes.tracklist;
          _results = [];
          for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
            track = _ref[index];
            if (!track.artists) {
              track.artists = releaseModel.attributes.artists;
            }
            if (track.artists[0].id !== 194) {
              _results.push((function() {
                var songModel;
                songModel = new SongModel({
                  id: track.artists[0].id,
                  index: index,
                  title: track.title
                });
                return songModel.fetch({
                  success: function() {
                    var songView;
                    songView = new SongView({
                      model: songModel
                    });
                    return songView.render();
                  }
                });
              })());
            } else {
              html = '<td></td><td></td><td></td>';
              _results.push($('#tltable tbody tr').eq(index).append(html));
            }
          }
          return _results;
        }
      });
    } else {
      return renderError(url);
    }
  };
  renderError = function(url) {
    $("#error strong").html(url + " is not a valid Discogs URL");
    $("#error").show();
    return $('.alert .close').click(function(e) {
      return $(this).parent().hide();
    });
  };
  if (urlparams.discogsurl) {
    url = unescape(urlparams.discogsurl);
    discogsparams = ValidateDiscogsUrl(url);
    if (discogsparams.valid) {
      $('#discogsurl').val(url);
      return getMetaData();
    }
  }
});

require ('newrelic');
express = require('express');
request = require('request');
var LastFmNode = require('lastfm').LastFmNode;

url = require('url');
app = express();

if (process.env.NODE_ENV && process.env.NODE_ENV == "production"){
	app.use(express.static(__dirname + '/build'));
}else{
	app.use(express.static(__dirname + '/static'));
}
app.use(express.bodyParser());

app.get('/discogs', function(req,res) {
	var discogsurl = url.parse(req.url, true).query["url"];
	var token = process.env.DISCOGS_TOKEN;
	discogsurl += (discogsurl.indexOf("?") !== -1 ? "&" : "?");
	discogsurl += "token="+token;
	if (discogsurl.indexOf("https://api.discogs.com") === 0){
		var options = {
			url: discogsurl,
			headers: {
				'User-Agent': 'Disconest/1.0 +http://www.disconest.com'
			}
		};
		// todo add error handling
		request(options).pipe(res);
	}else{
		res.send(404, 'Sorry cant find that!');
	}
});

app.post('/scrobble', function(req,res) {
	if(req.body.token){
		var token = req.body.token;
		var tracks = req.body.tracks;
		var lastfm = new LastFmNode({
			api_key: process.env.lastfm_apikey,
			secret: process.env.lastfm_secret
		});
		var session = lastfm.session({
			token: token,
			handlers: {
				success: function(session) {
					for (var i = 0; i<tracks.length; i++){
						lastfm.update('scrobble', session, tracks[i]);
					}
					res.json({"user": session.user, "tracks": tracks.length});
				},
				error: function(response){
					res.send(503, '');
				}
			}
		});
	}else{
		res.send(400, 'No token provided');
	}
});

// Spotify auth
var SPOTIFY_ID = process.env.SPOTIFY_ID;
var SPOTIFY_SECRET = process.env.SPOTIFY_SECRET;
var token = "";
refreshToken(null, null, null);

function refreshToken(callback, ids, res){
	var authOptions = {
		url: 'https://accounts.spotify.com/api/token',
		headers: {
			'Authorization': 'Basic ' + (new Buffer(SPOTIFY_ID + ':' + SPOTIFY_SECRET).toString('base64'))
		},
		form: {
			grant_type: 'client_credentials'
		},
		json: true
	};
	request.post(authOptions, function(error, response, body) {
		if (!error && response.statusCode === 200) {
			// use the access token to access the Spotify Web API
			token = body.access_token;
			if (callback){
				callback(ids, res);
			}
		}
	});
}

function getAudioSummary(ids, res){
	var options = {
		url: 'https://api.spotify.com/v1/audio-features/?ids='+ids,
		headers: {
			'Authorization': 'Bearer ' + token
		},
		json: true
	};
	var r = request(options);
	r.on('response', function(response){
		if (response.statusCode == 401) {
			refreshToken(getAudioSummary, ids, res);
		}else{
			r.pipe(res);
		}
	});
}
app.get('/spotifyAudioFeatures', function(req, res) {
	var id = url.parse(req.url, true).query["ids"];
	if (id){
		getAudioSummary(id, res);
	}else{
		res.send(404, 'Sorry cant find that!');
	}
});

var port = process.env.PORT || 3000;
app.listen(port);
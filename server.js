express = require('express');
request = require('request');
var LastFmNode = require('lastfm').LastFmNode;


url = require('url');
app = express();

app.use(express.static(__dirname + '/static'));
app.use(express.bodyParser());

app.get('/discogs', function(req,res) {
	var discogsurl = url.parse(req.url, true).query["url"];
	if (discogsurl.indexOf("http://api.discogs.com") === 0){
		var options = {
			url: discogsurl,
			headers: {
				'User-Agent': 'Disconest/1.0 +http://www.disconest.com'
			}
		};
		request(options).pipe(res);
	}else{
		res.send(404, 'Sorry cant find that!');
	}
});

app.get('/pixogs', function(req,res) {
	var discogsimg = url.parse(req.url, true).query["img"];
	var urlending = discogsimg.substring(discogsimg.length-3);
	var isimg = ["png", "jpg", "peg"].indexOf(urlending)!==-1;
	if (discogsimg.indexOf("http://api.discogs.com/image/")===0 && isimg){
		discogsimg = discogsimg.replace("api.discogs.com","s.pixogs.com");
		var options = {
			url: discogsimg,
			headers: {
				'User-Agent': 'Disconest/1.0 +http://www.disconest.com'
			}
		};
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

var port = process.env.PORT || 3000;
app.listen(port);

express = require('express');
request = require('request');
url = require('url');
app = express();

app.use(express.static(__dirname + '/static'));

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
	if (discogsimg.indexOf("http://api.discogs.com/image/")===0 && (discogsimg.substring(discogsimg.length-4) == "jpeg" || discogsimg.substring(discogsimg.length-3) == "png" )){
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
var port = process.env.PORT || 3000;
app.listen(port);

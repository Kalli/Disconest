express = require('express');
request = require('request');
url = require('url');
app = express();

app.use(express.static(__dirname + '/static'));

app.get('/discogs', function(req,res) {
	discogsurl = url.parse(req.url, true).query["url"];
	if (discogsurl.indexOf("http://api.discogs.com") === 0){
		request(discogsurl).pipe(res);
	}else{
		res.send(404, 'Sorry cant find that!');
	}
});

app.get('/pixogs', function(req,res) {
	discogsimg = url.parse(req.url, true).query["img"];
	if (discogsimg.indexOf("http://api.discogs.com/image/")===0 && discogsimg.substring(discogsimg.length-4) == "jpeg"){
		request(discogsimg).pipe(res);
	}else{
		res.send(404, 'Sorry cant find that!');
	}
});
app.listen(8000);

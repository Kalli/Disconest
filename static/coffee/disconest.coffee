class Disconest
	constructor: (@discogsid, @discogstype) ->
		@getDiscogsInformation(@discogsid, @discogstype)
		@tldomelement = "#tltable"

	# discogs stuff
	getDiscogsInformation: (id, type) ->
		url = "/discogs?url=http://api.discogs.com/"+type+"/"+id
		$.ajax 
		    dataType: "json"
		    url: url
		    data: []
		    success: (response) =>
		    	@discogsCallback(response)

	discogsCallback: (response) ->
		@discogsinfo = response
		@renderDiscogsInformation(response)
		@getTracklist()
		@updateHistory()

	renderDiscogsInformation: () ->
		source = $("#release-template").html()
		template = Handlebars.compile(source)
		html = template(@discogsinfo)
		$("#release").html(html)
		@addVideoLinks()

	updateHistory: () ->
		url = 'http://www.discogs.com/'+@discogstype.substring(0,@discogstype.length-1)+"/"+@discogsid
		window.history.pushState({"discogsid":@discogsid, "discogstype": @discogstype}, "Disconest Data for "+@discogsinfo.title, "?discogsurl="+url)

	addVideoLinks: () ->
		if @discogsinfo.videos
			for video in @discogsinfo.videos
				for track, index in @discogsinfo.tracklist
					if video.description.toLowerCase().indexOf(track.title.toLowerCase()) != -1
						link = $('<a>').attr('href',video.uri).attr('target', '_blank').addClass("yt").text("Youtube")
						$(@tldomelement+' tbody').find('tr').eq(index).find('.link').append(link)

	# echonest stuff
	getTracklist: (tltable) ->
		$(@tldomelement+' tbody').find('tr').each((index, element)=>
			@getEchonestInformation(index, $(element).data())
		)

	getEchonestInformation: (index, data) ->
		url = 'http://developer.echonest.com/api/v4/song/search?api_key=BB7QVYHAMYUOT4ESL&format=json&results=1&artist_id=discogs:artist:'+data.artistid+'&title='+data.title
		buckets = '&bucket=audio_summary&bucket=tracks&bucket=id:deezer&bucket=id:spotify-WW'
		url += buckets
		$.ajax 
		    dataType: "json"
		    url: url    
		    data: []
		    success: (response) =>
		   		@echonestCallback(index, response.response)

	echonestCallback: (index, response) ->
		@discogsinfo.tracklist[index].echonestinfo = response.songs[0]
		if response.songs.length > 0 
			audio_summary = response.songs[0].audio_summary
			if audio_summary
				minutes = String(Math.floor(audio_summary.duration / 60))
				seconds = String(Math.floor(audio_summary.duration % 60))
				if seconds.length == 1
					seconds += "0"
				$('#tltable tbody tr').eq(index).find(".duration").text(minutes+":"+seconds)
				html = ""
				html += '<td class="center">'+audio_summary.key+'</td>'
				html += '<td class="center">'+audio_summary.time_signature+'</td>'
				html += '<td class="center">'+audio_summary.tempo+'</td>'
				@addStreamingLinks(index)
		else
			html = '<td></td><td></td><td></td>'
		$('#tltable tbody tr').eq(index).append(html)
		

	addStreamingLinks: (index) ->
		sp = false
		de = false
		for track in @discogsinfo.tracklist[index].echonestinfo.tracks
			if track.catalog == "spotify-WW" and not sp
				url = "http://open.spotify.com/track/"+track.foreign_id.split("spotify-WW:track:")[1]
				link = $('<a>').attr('href',url).attr('target', '_blank').addClass("sp").text("Spotify")
				sp = true
				$(@tldomelement+' tbody').find('tr').eq(index).find('.link').append(link)
			if track.catalog == "deezer" and not de
				url = "http://www.deezer.com/track/"+track.foreign_id.split("deezer:track:")[1]
				link = $('<a>').attr('href',url).attr('target', '_blank').addClass("de").text("Deezer")
				de = true
				$(@tldomelement+' tbody').find('tr').eq(index).find('.link').append(link)		


	# Handlebars template stuff
	Handlebars.registerHelper('tracklist', (tracks, artists, videos, options) ->
		out = "<h3>Tracklist</h3>"
		out += '<table id="tltable" class="table">'
		header = '<thead>'
		header += '<td>'+h+'</td>' for h in ['Position', 'Duration', 'Artist', 'Title', 'Links']
		header += '<td class="center">'+h+'</td>' for h in ['Key', 'Time signature', 'BPM']
		out += header+'</thead>'
		for track in tracks
			trackartist = ''
			trackartistid = ''
			if track.artists
				for artist in track.artists
					trackartist = artist.name + artist.join
					trackartistid = artist.id
			else
				for artist in artists
					trackartist = artist.name + artist.join
					trackartistid = artist.id
			out += '<tr data-artistid="'+trackartistid+'" data-title="'+track.title+'">'
			out += '<td>'+track.position+'</td>'
			out += '<td class="duration">'+track.duration+'</td>'
			out += '<td >'+trackartist+'</td>'
			out += '<td >'+track.title+'</td>'
			out += '<td class="link"></td>'
			out +='</tr>'
		out += '</table>'
		return out
	)




$(document).ready ->
	ValidateDiscogsUrl = (url) ->
		discogsparams = {}
		regexp = /(?:https?:\/\/)?(?:www.)?discogs.com\/.*?\/?(release|master)\/(\d+)/
		matches = url.match(regexp)
		if matches and matches.length == 3
			discogsparams.valid = true
			discogsparams.type = matches[1]+"s"
			discogsparams.id = matches[2]
		else
			discogsparams.valid = false
		return discogsparams

	$('#discogsurl').keypress((e)=>
		if e.which == 13
			getMetaData()
		return false
	)

	$('#getmetadata').click(()=>
		getMetaData()
	)

	getMetaData = () ->
		url = $('#discogsurl').val()
		regexp = /(?:https?:\/\/)?(?:www.)?discogs.com\/.*?\/(release|master)\/(\d+)/
		matches = url.match(regexp)
		discogsparams = ValidateDiscogsUrl(url)
		if discogsparams.valid
			disconest = new Disconest(discogsparams.id, discogsparams.type)
		else
			renderError(url)

	renderError = (url) ->
		source = $("#error-template").html()
		template = Handlebars.compile(source)
		html = template({"url":url,"error":" is not a valid Discogs release url!"})
		$("#error").html(html)

	params = document.URL.split("?")
	if params.length > 1
		params = params[1].split("&")
		for param in params
			kv = param.split("=")
			if kv.length == 2 and kv[0] =="discogsurl"
				discogsparams = ValidateDiscogsUrl(kv[1])
				if discogsparams.valid
					disconest = new Disconest(discogsparams.id, discogsparams.type)

window.onpopstate = (e)->
	if e.state and e.state.discogsid and e.state.discogstype
		disconest = new Disconest(e.state.discogsid, e.state.discogstype)
	 

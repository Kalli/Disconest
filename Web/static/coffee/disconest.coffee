$(document).ready ->
	# discogs stuff
	getDiscogsInformation = (id, type) ->
		url = "/discogs?url=http://api.discogs.com/"+type+"/"+id
		$.ajax 
		    dataType: "json"
		    url: url
		    data: []
		    success: (response) =>
		    	discogsCallback(response)

	discogsCallback = (response) ->
		renderDiscogsInformation(response)
		getTracklist("#tltable")


	renderDiscogsInformation = (context) ->
		source = $("#release-template").html()
		template = Handlebars.compile(source)
		html = template(context)
		$("#release").html(html)

	# echonest stuff
	getTracklist = (tltable) ->
		$(tltable+' tbody').find('tr').each((index, element)->
			getEchonestInformation(index, $(element).data())
		)

	getEchonestInformation = (index, data) ->
		url = 'http://developer.echonest.com/api/v4/song/search?api_key=BB7QVYHAMYUOT4ESL&format=json&results=1&artist_id=discogs:artist:'+data.artistid+'&title='+data.title+'&bucket=audio_summary'
		$.ajax 
		    dataType: "json"
		    url: url    
		    data: []
		    success: (response) =>
		   		echonestCallback(index, response.response)

	echonestCallback = (index, response) ->
		audio_summary = response.songs[0].audio_summary
		html = ""
		html += '<td>'+audio_summary.key+'</td>'
		html += '<td>'+audio_summary.time_signature+'</td>'
		html += '<td>'+audio_summary.tempo+'</td>'
		$($('#tltable tbody tr')[index]).append(html)

	# Handlebars template stuff
	Handlebars.registerHelper('tracklist', (tracks, artists, videos, options) ->
		out = "<h3>Tracklist</h3>"
		out += '<table id="tltable" class="table">'
		header = '<thead>'
		header += '<td>'+h+'</td>' for h in ['position', 'duration', 'artist', 'title', 'key', 'time signature', 'bpm']
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
			out += '<td>'+track.duration+'</td>'
			out += '<td >'+trackartist+'</td>'
			out += '<td >'+track.title+'</td>'
			out +='</tr>'
		out += '</table>'
		# for video in videos
			# id = video.uri.split("?v=")[1]
			# out+='<iframe width="100" height="56" src="//www.youtube.com/embed/'+id+'" frameborder="0" allowfullscreen></iframe>'
		return out
	)

	$('#getmetadata').click(()->
		url = $('#discogsurl').val()
		regexp = /(?:https?:\/\/)?(?:www.)?discogs.com\/.*?\/(release|master)\/(\d+)/
		matches = url.match(regexp)
		if matches and matches.length == 3
			getDiscogsInformation(matches[2], matches[1]+"s")
		else
			renderError(url)
	)

	renderError = (url) ->
		source = $("#error-template").html()
		template = Handlebars.compile(source)
		html = template({"url":url,"error":" is not a valid Discogs release url!"})
		$("#error").html(html)

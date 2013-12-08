$(document).ready ->
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


		renderDiscogsInformation: () ->
			source = $("#release-template").html()
			template = Handlebars.compile(source)
			html = template(@discogsinfo)
			$("#release").html(html)
			@addVideoLinks()

		addVideoLinks: () ->
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
					html = ""
					html += '<td>'+audio_summary.key+'</td>'
					html += '<td>'+audio_summary.time_signature+'</td>'
					html += '<td>'+audio_summary.tempo+'</td>'
					$('#tltable tbody tr').eq(index).append(html)
				@addStreamingLinks(index)

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
			header += '<td>'+h+'</td>' for h in ['Position', 'Duration', 'Artist', 'Title', 'Links', 'Key', 'Time signature', 'BPM']
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
				out += '<td class="link"></td>'
				out +='</tr>'
			out += '</table>'
			return out
		)

		$('#getmetadata').click(()->
			url = $('#discogsurl').val()
			regexp = /(?:https?:\/\/)?(?:www.)?discogs.com\/.*?\/(release|master)\/(\d+)/
			matches = url.match(regexp)
			if matches and matches.length == 3
				disconest = new Disconest(matches[2], matches[1]+"s")
			else
				renderError(url)
		)

		renderError: (url) ->
			source = $("#error-template").html()
			template = Handlebars.compile(source)
			html = template({"url":url,"error":" is not a valid Discogs release url!"})
			$("#error").html(html)

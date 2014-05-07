
echonestresponse = {"response": {"status": {"version": "4.2", "code": 0, "message": "Success"}, "songs": [{"title": "Casanova", "artist_name": "Actress", "artist_foreign_ids": [{"catalog": "deezer", "foreign_id": "deezer:artist:286221"}, {"catalog": "spotify-WW", "foreign_id": "spotify-WW:artist:3bg5rmICvmA8dmYVAdKGYH"}], "tracks": [{"foreign_release_id": "deezer:release:552584", "catalog": "deezer", "foreign_id": "deezer:track:6050014", "id": "TRADJDF139D4EFC7DF"}, {"foreign_release_id": "deezer:release:819654", "catalog": "deezer", "foreign_id": "deezer:track:8930456", "id": "TRPKOJI139D77864A8"}, {"foreign_release_id": "spotify-WW:release:5iMp6bIMnBg0UpouIXUqxX", "catalog": "spotify-WW", "foreign_id": "spotify-WW:track:57PBOWCCYOunLnPVB3GkXp", "id": "TRZOJIY133864E7016"}, {"foreign_release_id": "spotify-WW:release:5Wr0QQB07WVGrDm6pHKwCa", "catalog": "spotify-WW", "foreign_id": "spotify-WW:track:4cuKnFwrrFN6dbrdZ1g3DA", "id": "TROBYWX13A9C62E0F3"}, {"foreign_release_id": "spotify-WW:release:0u1XILnyJLiv4EMbaEymXg", "catalog": "spotify-WW", "foreign_id": "spotify-WW:track:3LNnNu5ksgfRmZ5ntUh1eV", "id": "TRDJTSU143E3F42419"}], "artist_id": "AR6T9P01187B9B2B9B", "id": "SOBKNAI1311AFDD2BB", "audio_summary": {"key": 1, "analysis_url": "http://echonest-analysis.s3.amazonaws.com/TR/RBT7lgTrxQS1ZQ49_b5qUT0TdErv9dTkIFMmcp4ieipr5i18z6WckLBidGtt8GZN_xqHsopV3I-f9LeEA%3D/3/full.json?AWSAccessKeyId=AKIAJRDFEY23UEVW42BQ&Expires=1398104106&Signature=il2oa/OarPy2TJ4fC0eWNhbctCk%3D", "energy": 0.632768, "liveness": 0.24232899999999999, "tempo": 120.97199999999999, "speechiness": 0.257241, "acousticness": 0.0073540000000000003, "mode": 0, "time_signature": 4, "duration": 149.27955, "loudness": -13.914, "audio_md5": null, "valence": 0.34080300000000002, "danceability": 0.40631099999999998}}]}}

describe 'The song model', () ->
    artistid = 211501
    title = 'Casanova'
    songModel = new SongModel({id:artistid, title: title})

    beforeEach () ->
        spyOn($, "ajax").and.callFake (params) ->
            params.success(echonestresponse)
                
    it 'Correctly creates a song model', () ->
        expect(songModel.id).toEqual(artistid)
        expect(songModel.attributes.title).toEqual(title)

    it 'Correctly makes ajax calls for Echonest information', () ->
        songModel.fetch()
        expect($.ajax).toHaveBeenCalledWith(
            jasmine.objectContaining(
                url: songModel.url()
            )
        )

    it 'Correctly stores Echonest information in the model', () ->
        expect(songModel.attributes.response.songs).toEqual(echonestresponse.response.songs)

discogsresponse = {"status": "Accepted", "styles": ["Bass Music", "Techno", "Dubstep", "Experimental", "Electro"], "videos": [{"duration": 530, "description": "Actress - Hubble", "embed": true, "uri": "http://www.youtube.com/watch?v=5HNS8cKtU8o", "title": "Actress - Hubble"}, {"duration": 406, "description": "Actress - Get Ohn (Fairlight Mix)", "embed": true, "uri": "http://www.youtube.com/watch?v=YnIc9LOZjWk", "title": "Actress - Get Ohn (Fairlight Mix)"}, {"duration": 369, "description": "Actress - Lost", "embed": true, "uri": "http://www.youtube.com/watch?v=WcnRT-m9MYo", "title": "Actress - Lost"}, {"duration": 178, "description": "Actress - Always Human", "embed": true, "uri": "http://www.youtube.com/watch?v=AqUzSq1MVh0", "title": "Actress - Always Human"}, {"duration": 335, "description": "Actress - Bubble Buts And Equations", "embed": true, "uri": "http://www.youtube.com/watch?v=h0bJUbcBP_c", "title": "Actress - Bubble Buts And Equations"}, {"duration": 322, "description": "Actress - Maze", "embed": true, "uri": "http://www.youtube.com/watch?v=KD8VdZ7Xjfo", "title": "Actress - Maze"}, {"duration": 210, "description": "Actress - Purrple Splazsh", "embed": true, "uri": "http://www.youtube.com/watch?v=4VcvagMULOA", "title": "Actress - Purrple Splazsh"}, {"duration": 137, "description": "Actress-Senorita", "embed": true, "uri": "http://www.youtube.com/watch?v=xqQFMjUySio", "title": "Actress-Senorita"}, {"duration": 192, "description": "Actress - Wrong Potion", "embed": true, "uri": "http://www.youtube.com/watch?v=Q3SSj-XHEyY", "title": "Actress - Wrong Potion"}], "series": [], "released_formatted": "31 May 2010", "labels": [{"id": 8895, "resource_url": "http://api.discogs.com/labels/8895", "catno": "HJRLP49", "name": "Honest Jon's Records", "entity_type": "1"}], "estimated_weight": 460, "community": {"status": "Accepted", "rating": {"count": 192, "average": 4.69}, "have": 911, "contributors": [{"username": "gram2000", "resource_url": "http://api.discogs.com/users/gram2000"}, {"username": "r-a-u-m", "resource_url": "http://api.discogs.com/users/r-a-u-m"}, {"username": "dcarney", "resource_url": "http://api.discogs.com/users/dcarney"}, {"username": "mick667", "resource_url": "http://api.discogs.com/users/mick667"}, {"username": "elliwj", "resource_url": "http://api.discogs.com/users/elliwj"}, {"username": "ryanp", "resource_url": "http://api.discogs.com/users/ryanp"}, {"username": "luuk", "resource_url": "http://api.discogs.com/users/luuk"}], "want": 456, "submitter": {"username": "gram2000", "resource_url": "http://api.discogs.com/users/gram2000"}, "data_quality": "Needs Vote"}, "released": "2010-05-31", "master_url": "http://api.discogs.com/masters/251579", "year": 2010, "images": [{"uri": "http://api.discogs.com/image/R-2281630-1323803070.jpeg", "height": 600, "width": 600, "resource_url": "http://api.discogs.com/image/R-2281630-1323803070.jpeg", "type": "primary", "uri150": "http://api.discogs.com/image/R-150-2281630-1323803070.jpeg"}], "format_quantity": 2, "id": 2281630, "genres": ["Electronic"], "thumb": "http://api.discogs.com/image/R-150-2281630-1323803070.jpeg", "extraartists": [{"join": "", "name": "Will Bankhead", "anv": "", "tracks": "", "role": "Design", "resource_url": "http://api.discogs.com/artists/515231", "id": 515231}, {"join": "", "name": "Christoph Grote-Beverborg", "anv": "CGB", "tracks": "", "role": "Mastered By [Cut By]", "resource_url": "http://api.discogs.com/artists/462008", "id": 462008}], "title": "Splazsh", "country": "UK", "notes": "Mastered at D&M.\r\n\r\n\u2117&\u00a9 Honest Jon's Records 2010\r\n\r\nTrack durations and BPM do not appear on the record.\r\n\r\nBPM:\r\nA1: 130 | A2: 119 | A3: 102\r\nB1: 126 | B2: 116 | B3: 120\r\nC1: 120 | C2: 150 | C3: 126 | C4: 135\r\nD1: 130 | D2: 160 | D3: 97 | D4: 120\r\n", "identifiers": [{"type": "Matrix / Runout", "description": "A-Side Runout", "value": "HJRLP 49 A CGB@D&M"}, {"type": "Matrix / Runout", "description": "B-Side Runout", "value": "HJRLP 49 B CGB@D&M"}, {"type": "Matrix / Runout", "description": "C-Side Runout", "value": "HJRLP 49 C CGB@D&M"}, {"type": "Matrix / Runout", "description": "D-Side Runout", "value": "HJRLP 49 D CGB@D&M"}], "companies": [{"name": "Dubplates & Mastering", "entity_type": "29", "catno": "", "resource_url": "http://api.discogs.com/labels/264266", "id": 264266, "entity_type_name": "Mastered At"}], "uri": "http://www.discogs.com/Actress-Splazsh/release/2281630", "artists": [{"join": "", "name": "Actress", "anv": "", "tracks": "", "role": "", "resource_url": "http://api.discogs.com/artists/211501", "id": 211501}], "formats": [{"descriptions": ["LP", "Album"], "name": "Vinyl", "qty": "2"}], "resource_url": "http://api.discogs.com/releases/2281630", "master_id": 251579, "tracklist": [{"duration": "8:46", "position": "A1", "type_": "track", "title": "Hubble"}, {"duration": "6:07", "position": "A2", "type_": "track", "title": "Lost"}, {"duration": "1:15", "position": "A3", "type_": "track", "title": "Futureproofing"}, {"duration": "6:45", "position": "B1", "type_": "track", "title": "Get Ohn (Fairlight Mix)"}, {"duration": "2:58", "position": "B2", "type_": "track", "title": "Always Human"}, {"duration": "5:33", "position": "B3", "type_": "track", "title": "Bubble Butts And Equations"}, {"duration": "5:21", "position": "C1", "type_": "track", "title": "Maze"}, {"duration": "3:27", "position": "C2", "type_": "track", "title": "Purrple Splazsh"}, {"duration": "2:10", "position": "C3", "type_": "track", "title": "Senorita"}, {"duration": "6:13", "position": "C4", "type_": "track", "title": "Let's Fly"}, {"duration": "3:11", "position": "D1", "type_": "track", "title": "Wrong Potion"}, {"duration": "2:37", "position": "D2", "type_": "track", "title": "Supreme Cunnilingus"}, {"duration": "5:00", "position": "D3", "type_": "track", "title": "The Kettle Men"}, {"duration": "2:27", "position": "D4", "type_": "track", "title": "Casanova"}], "data_quality": "Needs Vote"}

describe 'The release model', () ->
    type = 'releases'
    id = 2281630
    releaseModel = new ReleaseModel({type: type, id: id})

    beforeEach () ->
        spyOn($, "ajax").and.callFake (params) ->
            if /discogs/.test(params.url)
                params.success(discogsresponse)
            if /echonest/.test(params.url)
                params.success(echonestresponse)

    it 'Correctly creates a release model', () ->
        expect(releaseModel.id).toEqual(id)
        expect(releaseModel.attributes.type).toEqual(type)

    it 'Correctly makes ajax calls for Discogs information', () ->
        releaseModel.fetch()
        expect($.ajax).toHaveBeenCalledWith(
            jasmine.objectContaining(
                url: '/discogs?url=http://api.discogs.com/'+type+'/'+id
            )
        )
    
    it 'Correctly stores Discogs information in the model', () ->
        expect(releaseModel.attributes.artists).toEqual(discogsresponse.artists)
        expect(releaseModel.attributes.tracklist).toEqual(discogsresponse.tracklist)

lastfmresponse = {"user":"user"}
describe 'Scrobbling model', () ->
    type = 'releases'
    id = 2281630
    token = "mocktoken"
    releaseModel = new ReleaseModel({type: type, id: id, lastfmtoken: token})

    releaseView = new ReleaseView({model:releaseModel, el: $('body')})

    beforeEach () ->
        spyOn($, "ajax").and.callFake (params) ->
            if /discogs/.test(params.url)
                params.success(discogsresponse)
            if /scrobble/.test(params.url)
                params.success(lastfmresponse)

    it 'Makes the correct ajax calls when scrobbling', () ->
        releaseModel.fetch()
        releaseView.scrobble()
        expect($.ajax).toHaveBeenCalledWith(
            jasmine.objectContaining(
                url: '/scrobble'
            )
        )

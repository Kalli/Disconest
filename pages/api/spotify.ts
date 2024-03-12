import type { NextApiRequest, NextApiResponse } from 'next';
import { makeRequest } from '../../requests';
import { Album, SearchResultsMap, AudioFeaturesCollection, AlbumWithAudioFeatures } from '@/app/types/spotify';

type ResponseData = Object;

// Spotify auth
const SPOTIFY_ID = process.env.SPOTIFY_ID;
const SPOTIFY_SECRET = process.env.SPOTIFY_SECRET;

const refreshToken = async ():Promise<string> =>  {
	var authOptions = {
		hostname: 'accounts.spotify.com',
        path: '/api/token',
        method: 'POST',
		headers: {
			'Authorization': 'Basic ' + (new Buffer(SPOTIFY_ID + ':' + SPOTIFY_SECRET).toString('base64')),
            'Content-Type': 'application/x-www-form-urlencoded',
		},
    };
    const postData = 'grant_type=client_credentials';
    const authRes = await makeRequest(authOptions, postData);
    return String(authRes.access_token);
}

const spotifySearch = async (title: string, artist: string, token: string) : Promise<SearchResultsMap|null>=> {
    const qs = (
        '?q=album:' + encodeURIComponent(title) +
        '%20artist:' + encodeURIComponent(artist) +
        '&type=album'
    );
    var options = {
        host: 'api.spotify.com',
        path: '/v1/search' + qs,
        headers: {
            'Authorization': 'Bearer ' + token,
        },
        json: true
    }
    const response = makeRequest(options);
    // @ts-ignore
    return response as SearchResultsMap;
}

const getSpotifyAlbum = async (spotifySearchResponse: any, token: string) : Promise<Album|null> => {
    if (spotifySearchResponse.albums?.items.length > 0){
        const albumId = spotifySearchResponse.albums.items[0].id;
        var options = {
            host: 'api.spotify.com',
            path: '/v1/albums/' + albumId,
            headers: {
                'Authorization': 'Bearer ' + token,
            },
            json: true
        };
        const response = makeRequest(options);
        // @ts-ignore
        return response as SpotifyAlbum;
    }
    return null;
}

const getSpotifyTracksAudioFeatures = async (spotifyAlbum: any, token: string) : Promise<AudioFeaturesCollection|null> => {
    const ids = spotifyAlbum.tracks?.items?.reduce((ids: string, track: any) => {
        ids += track.id + ',';
        return ids;
    }, '');

    var options = {
        host: 'api.spotify.com',
        path: '/v1/audio-features/?ids='+ids,
		headers: {
			'Authorization': 'Bearer ' + token
		},
		json: true
	};
    const response = makeRequest(options);
    // @ts-ignore
    return response as AudioFeatures[];
}

const spotifyApiHandler = async (req: NextApiRequest, res: NextApiResponse<ResponseData>) => {
    const token = await refreshToken();
    if (req.query['title'] && req.query['artist']){
        const spotifySearchResponse = await spotifySearch(req.query['title'] as string, req.query['artist'] as string, token);
        const spotifyAlbum = await getSpotifyAlbum(spotifySearchResponse, token);  
        if (spotifyAlbum === null){
            res.status(404).json({error: 'No match found'});
        } else {
            const spotifyAudioFeatures = await getSpotifyTracksAudioFeatures(spotifyAlbum, token);
            if (spotifyAudioFeatures === null){
                res.status(404).json({error: 'No audio features found'});
            } else {
                const enrichedTracks = spotifyAlbum.tracks.items.map((track: any, index: number) => {
                    const audioFeatureMatch = spotifyAudioFeatures.audio_features.find((audioFeature: any) => {
                        return audioFeature.id === track.id;
                    })
                    return {
                        ...track,
                        ...audioFeatureMatch,
                    }
                })
                const enrichedSpotifyAlbum = {
                    ...spotifyAlbum,
                    tracks: {
                      ...spotifyAlbum.tracks,
                      items: enrichedTracks
                    }
                };
                res.status(200).json(enrichedSpotifyAlbum);
            }
        }
    }
    res.status(400).json({error: 'Invalid request'});
};

export default spotifyApiHandler;
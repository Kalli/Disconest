import type { NextApiRequest, NextApiResponse } from 'next';
import { Album, SearchResultsMap, AudioFeaturesCollection, AlbumWithAudioFeatures } from '@/app/types/spotify';

type ResponseData = Object;

// Spotify auth
const SPOTIFY_ID = process.env.SPOTIFY_ID;
const SPOTIFY_SECRET = process.env.SPOTIFY_SECRET;
const spotifyAccountsUrl = process.env.SPOTIFY_ACCOUNTS_URL || 'https://accounts.spotify.com';
const spotifyApiUrl = process.env.SPOTIFY_API_URL || 'https://api.spotify.com';
const spotifyAuthHeaders = {
    'Authorization': 'Basic ' + (new Buffer(SPOTIFY_ID + ':' + SPOTIFY_SECRET).toString('base64')),
    'Content-Type': 'application/x-www-form-urlencoded',
}

const refreshToken = async (): Promise<string> => {
    try {
        const authRes = await fetch(spotifyAccountsUrl + '/api/token', {
            method: 'POST',
            body: 'grant_type=client_credentials',
            headers: new Headers(spotifyAuthHeaders),
        });
        const authResJson = await authRes.json();
        return String(authResJson.access_token);
    } catch (error) {
        return '';
    }
}

const spotifySearch = async (title: string, artist: string, authHeader: {}) : Promise<SearchResultsMap|null> => {
    // spotify album titles, don't generally contain the "EP" suffix and punctuation characters dont alwasy match
    const filteredTitle = title.toLowerCase().replace(/( ep| e\.p\.)$/, '').replace(/[.,()"]/g, ' ');
    const qs = (
        '?q=album:' + encodeURIComponent(filteredTitle) +
        '%20artist:' + encodeURIComponent(artist) +
        '&type=album'
    );
    const path = '/v1/search' + qs;
    const spotifyApiResponse = await fetch(spotifyApiUrl + path, { headers: authHeader })
    const spotifyApiResponseJson = await spotifyApiResponse.json();
    // @ts-ignore
    const results = spotifyApiResponseJson as SearchResultsMap;
    // if we got not match on a "a side / b side" release, try searching for just "a side"
    // discogs releases often include both in the name, while Spotify releases use that pattern less frequently
    if (results.albums?.total === 0 && title.includes(' / ')){
        const revisedQs = (
            '?q=album:' + encodeURIComponent(filteredTitle.split(' / ')[0]) +
            '%20artist:' + encodeURIComponent(artist) +
            '&type=album'
        );
        const newPath = '/v1/search' + revisedQs;
        const secondSpotifyApiResponse = await fetch(spotifyApiUrl + newPath, { headers: authHeader })
        const secondSpotifyApiResponseJson = await secondSpotifyApiResponse.json();
        return secondSpotifyApiResponseJson as SearchResultsMap;
    }
    return results;
}

const getSpotifyAlbum = async (spotifySearchResponse: any, authHeader: {}) : Promise<Album|null> => {
    if (spotifySearchResponse.albums?.items.length > 0){
        // somewhat naively, we just take the first response
        const albumId = spotifySearchResponse.albums.items[0].id;
        const path = '/v1/albums/' + albumId;
        const spotifyApiResponse = await fetch(spotifyApiUrl + path, { headers: authHeader })
        const spotifyApiResponseJson = spotifyApiResponse.json();
        // @ts-ignore
        return spotifyApiResponseJson as SpotifyAlbum;
    }
    return null;
}

const getSpotifyTracksAudioFeatures = async (spotifyAlbum: any, authHeader: {}) : Promise<AudioFeaturesCollection|null> => {
    const ids = spotifyAlbum.tracks?.items?.reduce((ids: string, track: any) => {
        ids += track.id + ',';
        return ids;
    }, '');
    const path = '/v1/audio-features/?ids='+ids;
    const spotifyApiResponse = await fetch(spotifyApiUrl + path, { headers: authHeader });
    const spotifyApiResponseJson = spotifyApiResponse.json();
    // @ts-ignore
    return spotifyApiResponseJson as AudioFeatures[];
}

const spotifyApiHandler = async (req: NextApiRequest, res: NextApiResponse<ResponseData>) => {
    if (req.query['title'] && req.query['artist']){
        const token = await refreshToken();
        if (token === ''){
            res.status(500).json({error: 'Something went wrong with the Spotify token refresh. Please try again later.'});
        }
        const authHeader = {'Authorization': 'Bearer ' + token};
        const spotifySearchResponse = await spotifySearch(req.query['title'] as string, req.query['artist'] as string, authHeader);
        const spotifyAlbum = await getSpotifyAlbum(spotifySearchResponse, authHeader);  
        if (spotifyAlbum === null){
            res.status(404).json({error: 'No match found'});
        } else {
            const spotifyAudioFeatures = await getSpotifyTracksAudioFeatures(spotifyAlbum, authHeader);
            if (spotifyAudioFeatures === null){
                res.status(404).json({error: 'No audio features found'});
            } else {
                const enrichedTracks = spotifyAlbum.tracks.items.map((track: any, index: number) => {
                    const audioFeatureMatch = spotifyAudioFeatures.audio_features.find((audioFeature: any) => {
                        if (!audioFeature){
                            return false;
                        }
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
    } else {
        res.status(400).json({error: 'Invalid request'});
    }
};

export default spotifyApiHandler;
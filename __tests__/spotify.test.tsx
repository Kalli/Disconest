import { expect, describe, it } from 'vitest'
import { matchDiscogsAndSpotifyTracks } from '../src/app/spotify'
import SpotifySearchResponse from './fixtures/spotifySearchResponse.json'
import discogsRelease from './fixtures/discogsRelease.json'

describe('Spotify and Discogs Matching', () => {
    const discogsTrack = discogsRelease.tracklist[0];
    const spotifyTrack = SpotifySearchResponse.tracks.items[0];

    it('Should return discogs tracks if no spotify info is passed', () => {
        // @ts-ignore
        const tracks = matchDiscogsAndSpotifyTracks(discogsRelease.tracklist, []);
        expect(tracks.length).toBe(discogsRelease.tracklist.length);
        expect(tracks.every(track => track.spotify === undefined )).toBe(true);
    });

    it('Should return matches when name matches are exact', () => {
        // @ts-ignore
        const tracks = matchDiscogsAndSpotifyTracks(discogsRelease.tracklist, SpotifySearchResponse.tracks.items);
        expect(tracks.every(track => track.spotify !== undefined )).toBe(true);
    });

    it('Should match when case is different', () => {
        discogsTrack.title = discogsTrack.title.toLowerCase();
        // @ts-ignore
        const tracks = matchDiscogsAndSpotifyTracks([discogsTrack], [spotifyTrack]);
        expect(tracks.length).toBe(1);
        expect(tracks[0].spotify !== undefined).toBe(true);
    });

    it('Should match even if special characters do not match', () => {
        const titleWithSpecialCharacters = 'Title with (special characters".,)'
        const titleWithNoSpecialCharacters = 'Title with special characters'
        discogsTrack.title = titleWithSpecialCharacters;
        spotifyTrack.name = titleWithNoSpecialCharacters;
        // @ts-ignore
        const tracks = matchDiscogsAndSpotifyTracks([discogsTrack], [spotifyTrack]);
        expect(tracks.length).toBe(1);
        expect(tracks[0].spotify !== undefined).toBe(true);
    });

    it('Should match on unicode matches', () => {
        const titleWithSpecialCharacters = 'tötlé'
        const titleWithNoSpecialCharacters = 'totle'
        discogsTrack.title = titleWithSpecialCharacters;
        spotifyTrack.name = titleWithNoSpecialCharacters;
        // @ts-ignore
        const tracks = matchDiscogsAndSpotifyTracks([discogsTrack], [spotifyTrack]);
        expect(tracks.length).toBe(1);
        expect(tracks[0].spotify !== undefined).toBe(true);
    });

    it('Should match on duration and index', () => {
        discogsTrack.title = 'a different title';
        spotifyTrack.name = 'a title';
        // @ts-ignore
        const tracks = matchDiscogsAndSpotifyTracks([discogsRelease.tracklist[1], discogsTrack], [SpotifySearchResponse.tracks.items[1], spotifyTrack]);
        expect(tracks.length).toBe(2);
        expect(tracks[1].spotify !== undefined).toBe(true);
        expect(tracks[1].spotify?.name).toBe('a title');
    });
})
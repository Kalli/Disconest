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
        const titleWithSpecialCharacters = 'Title with (special characters".,\')'
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

    it('Should filter punctuation and non ascii characters', () => {
        discogsTrack.title = 'What About This Love (Dub Version)';
        spotifyTrack.name = 'What About This Love - Dub Version';
        spotifyTrack.duration_ms = 2320000;
        // @ts-ignore
        const tracks = matchDiscogsAndSpotifyTracks([discogsRelease.tracklist[1], discogsTrack], [SpotifySearchResponse.tracks.items[1], spotifyTrack]);
        expect(tracks.length).toBe(2);
        expect(tracks[1].spotify !== undefined).toBe(true);
        expect(tracks[1].spotify?.name).toBe(spotifyTrack.name);
    });

    it('Should pick the best match not just the first', () => {
        const spotifyFirstTrack = SpotifySearchResponse.tracks.items[1];
        spotifyFirstTrack.name = 'Title match';
        discogsTrack.title = 'Title match (but its the remix)';
        spotifyTrack.name = 'Title match (but its the remix)';
        // @ts-ignore
        const tracks = matchDiscogsAndSpotifyTracks([discogsRelease.tracklist[1], discogsTrack], [spotifyFirstTrack, spotifyTrack]);
        expect(tracks.length).toBe(2);
        expect(tracks[1].spotify !== undefined).toBe(true);
        expect(tracks[1].spotify?.name).toBe(spotifyTrack.name);
    });

    it('Not return spurious matches', () => {
        const spotifyFirstTrack = SpotifySearchResponse.tracks.items[1];
        spotifyFirstTrack.name = 'Title match';
        discogsTrack.title = 'This track has no match';
        spotifyTrack.name = 'This is a totally different track';
        spotifyTrack.duration_ms = 12312312
        // @ts-ignore
        const tracks = matchDiscogsAndSpotifyTracks([discogsRelease.tracklist[1], discogsTrack], [spotifyFirstTrack, spotifyTrack]);
        expect(tracks.length).toBe(2);
        expect(tracks[1].spotify === undefined).toBe(true);
    });

    it('Levenshtein Distance + index match should cross threshold', () => {
        const spotifyFirstTrack = SpotifySearchResponse.tracks.items[1];
        spotifyFirstTrack.name = 'Title match';
        discogsTrack.title = 'Levenshtein Distance';
        spotifyTrack.name = 'Levenshtein Distance1';
        spotifyTrack.duration_ms = 12312312
        // @ts-ignore
        const tracks = matchDiscogsAndSpotifyTracks([discogsRelease.tracklist[1], discogsTrack], [spotifyFirstTrack, spotifyTrack]);
        expect(tracks.length).toBe(2);
        expect(tracks[1].spotify !== undefined).toBe(true);
        expect(tracks[1].spotify?.name === 'Levenshtein Distance1').toBe(true);
    });
})
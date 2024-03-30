import React from 'react';
import { DiscogsTrackProps } from './release';
import { TrackWithAudioFeatures } from './types/spotify';

const keys = ['C', 'C#', 'D', 'E♭', 'E', 'F', 'F#', 'G', 'A♭', 'A', 'B♭', 'B'];
const mode = ['Minor', 'Major'];


export const matchDiscogsAndSpotifyTracks = (discogsTracks: DiscogsTrackProps[], spotifyTracks: TrackWithAudioFeatures[]) => {
    if (!spotifyTracks){
        return discogsTracks
    };
    return discogsTracks.map(discogsTrack => {
        const spotifyTrack = spotifyTracks.find(spotifyTrack => {
            // replace punctuation, parentheses and case to compare track names
            const spotifyName = spotifyTrack.name.toLowerCase().replace(/[.,()]/g, '')
            const discogsName = discogsTrack.title.toLowerCase().replace(/[.,()]/g, '')
            const name = spotifyName.indexOf(discogsName) != -1 || discogsName.indexOf(spotifyName) != -1
            return name
        })
        if (!spotifyTrack) {
            return {
                ...discogsTrack
            }
        }
        // we need to rename "key" to "musicalKey" because "key" is a reserved word in JSX
        const { key, ...spotifyTrackAttributes } = spotifyTrack;
        return {
            ...discogsTrack,
            spotify: {
                ...spotifyTrackAttributes,
                ...(key != null ? {musicalKey: keys[key]}:{}),
            },
        }
    })
}

export const SpotifyTrackMetadata : React.FC<TrackWithAudioFeatures> = (track) => {
    return (
        <>
            <td className="center">{track.musicalKey} {mode[track.mode]}</td>
            <td className="center">{track.time_signature}</td>
            <td className="center">{track.tempo.toFixed(1)}</td>
        </>
    )
}
import React, { useState, useRef } from 'react';
import { DiscogsTrackProps } from './release';
import { BPMCounter } from './bpmcounter';
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

type TrackRowProps = {
    showToolTip: boolean,
}
type TrackRowWithAudioFeatures = TrackWithAudioFeatures & TrackRowProps;

export const ManualMetadata : React.FC<TrackRowProps> = (props) => {
    const [tapped, setTapped] = useState<boolean>(false);
    const [tappedBPM, setTappedBPM] = useState<number>(0);

    if (tapped) {
        return (<>
            <td className="center"></td>
            <td className="center bpm" title='Click for BPM options'>
                {props.showToolTip ? <BPMCounter originalBpm={0} setBpm={setTappedBPM}/> : null}
                {tappedBPM.toFixed(1)}
            </td>
            <td className="center"></td>
        </>);
    } else {
        return (<td colSpan={3} className="no-data center" onClick={() => setTapped(true)}><small>No metadata found -  Tap to manually set BPMs</small></td>);
    }
}


export const SpotifyTrackMetadata : React.FC<TrackRowWithAudioFeatures> = (track) => {
    const [tappedBPM, setTappedBPM] = useState<number|null>(null);
    const bpm = tappedBPM || track.tempo;
    return (
        <>
            <td className="center">{track.musicalKey} {mode[track.mode]}</td>
            <td className="center bpm spotify-metadata" title='Click for BPM options'>
                { track.showToolTip ? <BPMCounter originalBpm={track.tempo} setBpm={setTappedBPM}/> : null}
                {bpm.toFixed(1)}
            </td>
            <td className="center">{track.time_signature} / 4</td>
        </>
    )
}
import React, { useState } from 'react';
import { DiscogsTrackProps } from './release';
import { BPMCounter } from './bpmcounter';
import { TrackWithAudioFeatures } from './types/spotify';
import unidecode from 'unidecode';

const keys = ['C', 'C#', 'D', 'E♭', 'E', 'F', 'F#', 'G', 'A♭', 'A', 'B♭', 'B'];
const mode = ['Minor', 'Major'];


export const matchDiscogsAndSpotifyTracks = (discogsTracks: DiscogsTrackProps[], spotifyTracks: TrackWithAudioFeatures[]) => {
    if (!spotifyTracks){
        return discogsTracks
    };
    const timeDurationRegex = /^\d{1,2}:\d{2}$/
    return discogsTracks.map((discogsTrack, discogsTrackIndex) => {
        const discogsName = discogsTrack.title.toLowerCase().replace(/[.,()"]/g, '')
        let spotifyTrack = spotifyTracks.find(spotifyTrack => {
            // replace punctuation, parentheses and case to compare track names
            const spotifyName = spotifyTrack.name.toLowerCase().replace(/[.,()"]/g, '')
            const name = spotifyName.indexOf(discogsName) != -1 || discogsName.indexOf(spotifyName) != -1
            return name;
        })
        // take another stab at trying to find a match, less precise matching, but might be good enough
        if (!spotifyTrack) {
            spotifyTrack = spotifyTracks.find((spotifyTrack, spotifyTrackIndex) => {
                // compare the ascii versions of both tracks
                const spotifyName = unidecode(spotifyTrack.name.toLowerCase().replace(/[.,()"]/g, '')).
                    replace(' & ', ' ').replace(' and ', ' ').trim();
                // replace certain characters that often differ between the platforms
                const discogsNameFiltered = unidecode(discogsName).replace(' & ', ' ').replace(' and ', ' ').trim();
                const name = spotifyName.indexOf(discogsNameFiltered) != -1 || discogsNameFiltered.indexOf(spotifyName) != -1
                if (name){
                    return name;
                }
                // check for track position and duration match
                if (discogsTrack.duration && timeDurationRegex.test(discogsTrack.duration)){
                    const [minutes, seconds] = discogsTrack.duration.split(':').map(num => parseInt(num));
                    const durationInSeconds = minutes * 60 + seconds;
                    const index = spotifyTrackIndex === discogsTrackIndex;
                    // if the index is the same and the duration differs by less than 2 seconds, its probably a match
                    if (index && Math.abs(durationInSeconds - spotifyTrack.duration_ms/1000) < 2){
                        return true;
                    }
                }
                return false;
            })
        }
        // if we still haven't found a match, return the original track
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
                {bpm? bpm.toFixed(1) : ''}
            </td>
            <td className="center">{track.time_signature} / 4</td>
        </>
    )
}
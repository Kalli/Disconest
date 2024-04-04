import React, { useState, useRef } from 'react';
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

type TrackRowProps = {
    showToolTip: boolean,
}
type TrackRowWithAudioFeatures = TrackWithAudioFeatures & TrackRowProps;

export const SpotifyTrackMetadata : React.FC<TrackRowWithAudioFeatures> = (track) => {
    const [tapCounts, setTapCounts] = useState<number>(0);
    const [tapStart, setTapStart] = useState<Date|null>(null);
    const [tappedBPM, setTappedBPM] = useState<number|null>(null);
    const tapEndRef = useRef<Date|null>(null);
    const tapIntervalIdRef = useRef<number|null>(null);

    const multiply = (multiplier:number, event: React.MouseEvent) => {
        event.stopPropagation();
        setTappedBPM((tappedBPM || track.tempo) * multiplier);
    }

    const tapBpms = (event: React.MouseEvent) => {
        event.stopPropagation();
        setTapCounts(tapCounts + 1);
        if (!tapStart){
            setTapStart(new Date());
            tapEndRef.current = null;
            tapIntervalIdRef.current = null;
        } else {
            const bpm = tapCounts * 1000 / ((new Date).getTime() - tapStart.getTime()) * 60;
            tapEndRef.current = new Date();
            setTappedBPM(bpm);
        }
        if (!tapIntervalIdRef.current){
            tapIntervalIdRef.current = Number(setInterval(() => {
                resetBpmTap(tapEndRef, tapIntervalIdRef);
            }, 2000));
        }
    }

    const resetBpmTap = (tapEndRef: React.RefObject<Date> | null, tapIntervalId: React.RefObject<number> | null,) => {
        if (tapEndRef?.current && new Date().getTime() - tapEndRef?.current.getTime() > 2000){
            setTapCounts(0);
            setTapStart(null);
            if (tapIntervalId?.current){
                clearInterval(tapIntervalId.current);
            }
        }
    }
    const bpm = tappedBPM || track.tempo;
    return (
        <>
            <td className="center">{track.musicalKey} {mode[track.mode]}</td>
            <td className="center bpm" title='Click for BPM options'>
                { track.showToolTip ? (<>
                    <div className='bpm-tool popover top'>
                    <div className="arrow" style={{"left": "50%"}}></div>
                    <div className="btn-group center">
                        <button className="btn btn-default btn-sm" onClick={(e) => multiply(2, e)} title='Double current bpm'>2×</button>
                        <button className="btn btn-default btn-sm" onClick={(e) => multiply(0.5, e)} title='Half current bpm'>½×</button>
                        <button className="btn btn-default btn-sm" onClick={(e) => tapBpms(e)} title='Tap bpm by using your mouse (resets after 2 seconds of inactivity)'>Tap</button>
                    </div>
                    </div>
                </>) : null}
                {bpm.toFixed(1)}
            </td>
            <td className="center">{track.time_signature}</td>
        </>
    )
}
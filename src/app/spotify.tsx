import React, { useState } from 'react';
import { DiscogsTrackProps } from './release';
import { BPMCounter } from './bpmcounter';
import { TrackWithAudioFeatures } from './types/spotify';
import unidecode from 'unidecode';

const keys = ['C', 'C#', 'D', 'E♭', 'E', 'F', 'F#', 'G', 'A♭', 'A', 'B♭', 'B'];
const mode = ['Minor', 'Major'];

const timeDurationRegex = /^\d{1,2}:\d{2}$/;
export const matchDiscogsAndSpotifyTracks = (discogsTracks: DiscogsTrackProps[], spotifyTracks: TrackWithAudioFeatures[]) => {
    if (!spotifyTracks){
        return discogsTracks
    };
    const matches = discogsTracks.map((discogsTrack, discogsTrackIndex) => {
        const { spotifyBestMatch } = spotifyTracks.reduce<{ spotifyBestMatch: TrackWithAudioFeatures | null, score: number }>((bestMatch, spotifyTrack, spotifyTrackIndex) => {
            const score = discogsSpotifyTrackMatchScore(discogsTrack, spotifyTrack, discogsTrackIndex, spotifyTrackIndex);
            if (score > 0 && score > bestMatch.score) {
                return { spotifyBestMatch: spotifyTrack, score: score };
            }
            return bestMatch;
        }, { spotifyBestMatch: null, score: -Infinity })
        if (spotifyBestMatch === null){
            return {
                ...discogsTrack
            }
        }
        // we need to rename "key" to "musicalKey" because "key" is a reserved word in JSX
        const { key, ...spotifyTrackAttributes } = spotifyBestMatch;
        return {
            ...discogsTrack,
            spotify: {
                ...spotifyTrackAttributes,
                ...(key != null ? {musicalKey: keys[key]}:{}),
            },
        }

    });
    return matches;
}

const discogsSpotifyTrackMatchScore = (
    discogsTrack: DiscogsTrackProps, spotifyTrack: TrackWithAudioFeatures,
    discogsTrackIndex: number, spotifyTrackIndex: number,    
) : number => {
    // exact title match should get the highest score
    const exactTitleMatch = discogsTrack.title === spotifyTrack.name ? 100 : 0;
    
    // matching after normalizing and removing non-ascii / non letter characters
    const discogsName = filterTrackTitle(discogsTrack.title);
    const spotifyName = filterTrackTitle(spotifyTrack.name);
    const discogsNameSubstring = spotifyName.indexOf(discogsName) != -1 ? 10 : 0;
    const spotifyNameSubstring = discogsName.indexOf(spotifyName) != -1 ? 10 : 0;

    // normalized Levenshtein distance, more likely to be a match
    const distance = levenshteinDistance(spotifyName, discogsName);
    const closeMatch = distance/spotifyName.length > 0.2? 8 : 0;

    // same position in the tracklist
    const indexMatch = spotifyTrackIndex === discogsTrackIndex? 15 : 0;

    // duration of the tracks being roughly similar
    let likelyTimeMatch = 0;
    if (discogsTrack.duration && timeDurationRegex.test(discogsTrack.duration)){
        const [minutes, seconds] = discogsTrack.duration.split(':').map(num => parseInt(num));
        const durationInSeconds = minutes * 60 + seconds;
        likelyTimeMatch = Math.abs(durationInSeconds - spotifyTrack.duration_ms/1000) < 2? 5:0;
    }
    
    return exactTitleMatch + discogsNameSubstring + spotifyNameSubstring + indexMatch + closeMatch + likelyTimeMatch;
}

function filterTrackTitle(trackTitle: string): string {
    const filteredTitle = trackTitle.
        toLowerCase().
        // punctuation characters
        replace(/[.,()?\-'"]/g, '').
        // & and ands 
        replace(' & ', ' ').replace(' and ', ' ').
        // remove double spaces or more
        replace(/\s{2,}/g, ' ')
        .trim();
    // convert non-latin/ascii characters
    return unidecode(filteredTitle);
}

function levenshteinDistance(s: string, t: string): number {
    // Create and initialize the matrix
    const dist = Array.from({ length: s.length + 1 }, (_, i) =>
        Array.from({ length: t.length + 1 }, (_, j) => i === 0 ? j : j === 0 ? i : 0)
    );

    // Fill the matrix
    dist.forEach((row, i) => {
        if (i === 0) return; // Skip the first row as it's already initialized
        row.forEach((_, j) => {
            if (j === 0) return; // Skip the first column of each row as it's already initialized
            const cost = s[i - 1] === t[j - 1] ? 0 : 1;
            dist[i][j] = Math.min(
                dist[i - 1][j] + 1,    // Deletion
                dist[i][j - 1] + 1,    // Insertion
                dist[i - 1][j - 1] + cost  // Substitution
            );
        });
    });

    return dist[s.length][t.length];
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
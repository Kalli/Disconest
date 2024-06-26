import React, { useState } from 'react';
import Image from "next/image";
import { SpotifyTrackMetadata, matchDiscogsAndSpotifyTracks, ManualMetadata} from './spotify';
import { Links } from './links';
import { AlbumWithAudioFeatures, TrackWithAudioFeatures } from './types/spotify';

export interface ReleaseProps {
    discogsRelease: DiscogsReleaseProps,
    spotifyData: AlbumWithAudioFeatures|null,
}

export interface DiscogsReleaseProps {
    uri: string,
    images: {
        type: string,
        uri: string,
        width: number,
        height: number,
        resource_url: string,
        uri150: string,
    }[],
    artists: DiscogsArtist[],
    title: string,
    styles: any[],
    genres: any[],
    year: any,
    labels: DiscogsLabel[],
    type: any,
    id: any,
    tracklist: DiscogsTrackProps[],
    videos: DiscogsVideo[],
}

export interface DiscogsLabel {
    catno: string,
    name: string,
}

export interface DiscogsArtist{
    name: string,
    anv?: string,
    join?: string,
    role?: string,
    tracks?: string,
    id: number,
    resource_url: string,
    thumbnail_url: string,
}

export const DiscogsRelease : React.FC<ReleaseProps> = (props: ReleaseProps) => {
    if (!props.discogsRelease || Object.keys(props.discogsRelease).length === 0 ){
        return null;
    }
    const { uri, images, artists, title, styles, genres, year, labels, tracklist, videos } = props.discogsRelease;
    const { spotifyData } = props;
    return (
        <div>
            <div className="row">
                <div className="artwork col-md-2">
                    <a target="_blank" href={uri}>
                        {images ? (
                            <img className="img-responsive center-block" src={images[0]['uri150']} width={150} height={150} alt={title + ' cover'} />
                        ) : (
                            <Image className="img-responsive center-block" src="/img/rekid-150.png" width={150} height={150} alt={title + ' cover'}/>
                        )}
                    </a>
                </div>
                <div className="release col-md-8">
                    <h1>
                        <a target="_blank" href={uri}>
                            {createArtistDisplayName(artists)} - {title}
                        </a>
                    </h1>
                    <table className="table release-info">
                        <tbody>
                            <tr>
                                <td>Genres &amp; styles:</td>
                                <td>
                                    {styles && styles.map(style => (
                                        <span key={style} className="badge">{style}</span>
                                    ))}
                                    {genres && genres.map(genre => (
                                        <span key={genre} className="badge">{genre}</span>
                                    ))}
                                </td>
                            </tr>
                            <tr>
                                <td>Year:</td>
                                <td>{year}</td>
                            </tr>
                            {labels && (
                                <tr>
                                    <td>Cat. no / Label:</td>
                                    <td>
                                        {labels.map(label => (
                                            <span key={label.catno}>{label.catno} / {label.name}</span>
                                        ))}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <Links labels={labels} artists={artists} />
            </div>
            <DiscogsTrackList videos={videos} tracklist={tracklist} artists={artists} spotify={spotifyData} />
        </div>
    );
}


export function createArtistDisplayName(artists: DiscogsReleaseProps['artists']): string {
    if (!artists) {
        return '';
    }
    return artists.reduce((artistDisplayName, artist, index) => {
        artist.name = artist.name.replace(/\s\(\d+\)/,"");
        if (artist.anv) {
          artistDisplayName += artist.anv;
        } else {
          artistDisplayName += artist.name;
        }
        if (index + 1 < artists.length) {
          if (artist.join == ",") {
            artistDisplayName += ", ";
          } else {
            artistDisplayName += " " + artist.join + " ";
          }
        }
        return artistDisplayName;
      }, "");
}

export interface DiscogsTrackProps {
    duration: string,
    position: string,
    title: string,
    spotifyId: string,
    tempo: number,
    time_signature: string,
    key: number,
    mode: number,
    artists: DiscogsArtist[],
    spotify?: TrackWithAudioFeatures,
    video?: DiscogsVideo,
    selectedRow?: boolean,
    type_: string,
    onClick: () => void,
}

interface DiscogsVideo {
    title: string,
    description: string,
    duration: number,
    embed: boolean,
    uri: string,
}

interface DiscogsTrackListProps {
    tracklist: DiscogsTrackProps[],
    artists: DiscogsArtist[],
    videos: DiscogsVideo[] 
    spotify?: AlbumWithAudioFeatures|null,
}

const DiscogsTrackList : React.FC<DiscogsTrackListProps> = ({ tracklist, artists, spotify, videos }) => {
    const [selectedRow, setSelectedRow] = useState<number | null>(null);
    const handleRowClick = (index: number) => {
        if (index === selectedRow) {
            setSelectedRow(null);
        } else {
            setSelectedRow(index);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            setSelectedRow(null);
        }
    };
    
    const headings = ["Position", "Duration", "Artist", "Title", "Links"];
    const detailedHeadings = [
      ["Key", "Key/Scale"],
      ["BPM", "Tempo in beats per minute"],
      ["TS", "Time Signature"],
    ];
    // compilations can have different artists for each track, otherwise use the release artist
    const noArtistInTracklist = tracklist.every(track => track.artists === undefined);

    let tracklistWithVideos = tracklist.map((track) => {
        const trackVideo = videos?.find((video) => {
            return video.title.toLowerCase().indexOf(track.title.toLowerCase()) != -1;
        })
        if (!trackVideo){
            return track;
        }
        return {
            ...track,
            video: trackVideo,
        }
    })

    if (spotify){
        tracklistWithVideos = matchDiscogsAndSpotifyTracks(tracklistWithVideos, spotify.tracks.items);
    }

    return(
        <div id="tracklist" className="row" onKeyDown={handleKeyDown} tabIndex={0}>
            <h3>Tracklist</h3>
            <div className="table-responsive">
                <table id="tltable" className="table">
                    <thead>
                        <tr>
                            {headings.filter(h => h !== "Artist" || !noArtistInTracklist).map((h) => (<th className={h} key={h}>{h}</th>))}
                            {detailedHeadings.map(([short, full]) => (
                                <th className={`${short} center`} title={full} key={short}>{short}</th>
                            ))}
                        </tr>
                    </thead>
                <tbody>
                    {tracklistWithVideos.map((track, index) => {
                        // @ts-ignore
                        return <DiscogsTrack key={index} {...track} selectedRow={index === selectedRow} onClick={() => handleRowClick(index)} />
                    })}
                </tbody>
                </table>
            </div>
        </div>
    )
}

const msToTime = (duration: number|undefined) : string => {
    if (!duration) {
        return '';
    }
    const seconds = Math.floor((duration / 1000) % 60);
    const minutes = Math.floor((duration / (1000 * 60)));
    return minutes + ':' + String(seconds).padStart(2, '0');
}

const DiscogsTrack : React.FC<DiscogsTrackProps> = (props) => {
    const { onClick, selectedRow, ...track } = props;
    const metaData = (track.spotify? 
        <SpotifyTrackMetadata {...track.spotify} showToolTip={props.selectedRow || false}/> :
        <ManualMetadata showToolTip={props.selectedRow || false} />
    )
    
    return (
        <tr key={track.position} onClick={onClick}>
            <td>{track.position.toUpperCase()}</td>
            <td>{track.duration || msToTime(track.spotify?.duration_ms)}</td>
            { track.artists? <td>{createArtistDisplayName(track.artists)}</td> : ''}
            <td className={track.type_ === 'heading'? 'heading' : ''}>{track.title}</td>
            <td className="link">
                {track.video && <a href={track.video.uri} target="_blank" rel="noopener noreferrer" className="yt">Youtube</a>}
                {track.spotify?.id && <a href={`https://open.spotify.com/track/${track.spotify.id}`} target="_blank" rel="noopener noreferrer" className="sp">Spotify</a>}
            </td>
            {track.type_ !== 'heading'? metaData : <td colSpan={3} ></td>}
        </tr>
    )
};
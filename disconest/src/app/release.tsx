import React from 'react';
import { SpotifyTrackMetadata, matchDiscogsAndSpotifyTracks } from './spotify';
import { AlbumWithAudioFeatures, TrackWithAudioFeatures } from './types/spotify';

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
    labels: {
        catno: string,
        name: string,
    }[],
    junolink: any,
    junoartistlink: any,
    junolabellink: any,
    type: any,
    id: any,
    tracklist: DiscogsTrackProps[],
    spotify: AlbumWithAudioFeatures,
}

interface DiscogsArtist{
    name: string,
    anv?: string,
    join?: string,
    role?: string,
    tracks?: string,
    id: number,
    resource_url: string,
    thumbnail_url: string,
}

export const DiscogsRelease : React.FC<DiscogsReleaseProps> = (props: DiscogsReleaseProps) => {
    const { uri, images, artists, title, styles, genres, year, labels, spotify, tracklist } = props;
    return (
        <div>
            <div className="row">
                <div className="artwork col-md-2">
                    <a target="_blank" href={uri}>
                        {images ? (
                            <img className="img-responsive center-block" src={images[0]['uri150']} />
                        ) : (
                            <img className="img-responsive center-block" src="/img/rekid-150.png" />
                        )}
                    </a>
                </div>
                <div className="release col-md-8">
                    <h1>
                        <a target="_blank" href={uri}>
                            {createArtistDisplayName(artists)} - {title}
                        </a>
                    </h1>
                    <table className="table">
                        <tbody>
                            <tr>
                                <td>Genres &amp; styles:</td>
                                <td>
                                    {styles.map(style => (
                                        <span key={style} className="badge">{style}</span>
                                    ))}
                                    {genres.map(genre => (
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
            </div>
            <DiscogsTrackList tracklist={tracklist} artists={artists} spotify={spotify} />
        </div>
    );
}


export function createArtistDisplayName(artists: DiscogsReleaseProps['artists']): string {
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
    video: string,
    spotifyId: string,
    tempo: number,
    time_signature: string,
    key: number,
    mode: number,
    artists: DiscogsArtist[],
    spotify?: TrackWithAudioFeatures,
}

interface DiscogsTrackListProps {
    tracklist: DiscogsTrackProps[],
    artists: DiscogsArtist[],
    spotify?: AlbumWithAudioFeatures,
}

const DiscogsTrackList : React.FC<DiscogsTrackListProps> = ({ tracklist, artists, spotify }) => {
    const headings = ["Position", "Duration", "Artist", "Title", "Links"];
    const detailedHeadings = [
      ["Key", "Key/Scale"],
      ["TS", "Time Signature"],
      ["BPM", "Tempo in beats per minute"]
    ];
    // compilations can have different artists for each track, otherwise use the release artist
    let tracklistWithArtists = tracklist.map((track) => {
        return {
            ...track,
            artists: track.artists?.length > 0 ? track.artists : artists,
        }
    });

    if (spotify){
        tracklistWithArtists = matchDiscogsAndSpotifyTracks(tracklistWithArtists, spotify.tracks.items);
    }

    return(
        <div id="tracklist" className="row">
            <h3>Tracklist</h3>
            <div className="table-responsive">
                <table id="tltable" className="table">
                    <thead>
                        <tr>
                            {headings.map((h) => (<th className={h} key={h}>{h}</th>))}
                            {detailedHeadings.map(([short, full]) => (
                                <td className={`${short} center`} title={full} key={short}>{short}</td>
                            ))}
                        </tr>
                    </thead>
                <tbody>
                    {tracklistWithArtists.map((track) => {
                        // @ts-ignore
                        return <DiscogsTrack key={track.position} {...track} />
                    })}
                </tbody>
                </table>
            </div>
        </div>
    )
}
const DiscogsTrack : React.FC<DiscogsTrackProps> = (props) => {
    const track = props;
    return (
        <tr key={track.position}>
            <td>{track.position.toUpperCase()}</td>
            <td className="duration">{track.duration}</td>
            <td>{createArtistDisplayName(track.artists)}</td>
            <td>{track.title}</td>
            <td className="link">
                {track.video && <a href={track.video} target="_blank" rel="noopener noreferrer" className="yt">Youtube</a>}
                {track.spotify?.id && <a href={`https://open.spotify.com/track/${track.spotify.id}`} target="_blank" rel="noopener noreferrer" className="sp">Spotify</a>}
            </td>
            {track.spotify? <SpotifyTrackMetadata {...track.spotify} /> : <td colSpan={3} className="no-data center">Sorry - No metadata found!</td>}
        </tr>
    )
};
import React from 'react';
import Image from "next/image";
import { SpotifyTrackMetadata, matchDiscogsAndSpotifyTracks } from './spotify';
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

    const tracklistWithVideos = tracklistWithArtists.map((track) => {
        const trackVideo = videos?.find((video) => {
            return video.title.toLowerCase().indexOf(track.title.toLowerCase()) != -1;
        })
        if (!trackVideo){
            return track;
        }
        return {
            ...track,
            video: trackVideo
        }
    })

    if (spotify){
        tracklistWithArtists = matchDiscogsAndSpotifyTracks(tracklistWithVideos, spotify.tracks.items);
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
                                <th className={`${short} center`} title={full} key={short}>{short}</th>
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
                {track.video && <a href={track.video.uri} target="_blank" rel="noopener noreferrer" className="yt">Youtube</a>}
                {track.spotify?.id && <a href={`https://open.spotify.com/track/${track.spotify.id}`} target="_blank" rel="noopener noreferrer" className="sp">Spotify</a>}
            </td>
            {track.spotify? <SpotifyTrackMetadata {...track.spotify} /> : <td colSpan={3} className="no-data center">Sorry - No metadata found!</td>}
        </tr>
    )
};
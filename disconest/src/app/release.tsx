import React from 'react';

const keys = ['C', 'C#', 'D', 'E♭', 'E', 'F', 'F#', 'G', 'A♭', 'A', 'B♭', 'B'];
const mode = ['Minor', 'Major'];

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

export const DiscogsRelease : React.FC<DiscogsReleaseProps> = (props:DiscogsReleaseProps) => {
    const { uri, images, artists, title, styles, genres, year, labels, junolink, junoartistlink, junolabellink, type, id, tracklist } = props;

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
                        <tr>
                            <td>Genres &amp; styles:</td>
                            <td>
                                {styles.map(style => (
                                    <span className="badge">{style}</span>
                                ))}
                                {genres.map(genre => (
                                    <span className="badge">{genre}</span>
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
                                        <span>{label.catno} / {label.name}</span>
                                    ))}
                                </td>
                            </tr>
                        )}
                    </table>
                </div>
            </div>
            <DiscogsTrackList tracklist={tracklist} artists={artists} />
        </div>
    );
}


function createArtistDisplayName(artists: DiscogsReleaseProps['artists']): string {
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

interface DiscogsTrackProps {
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
}

interface DiscogsTrackListProps {
    tracklist: DiscogsTrackProps[],
    artists: DiscogsArtist[],

}

const DiscogsTrackList : React.FC<DiscogsTrackListProps> = ({ tracklist, artists }) => {
    const headings = ["Position", "Duration", "Artist", "Title", "Links"];
    const detailedHeadings = [
      ["Key", "Key/Scale"],
      ["TS", "Time Signature"],
      ["BPM", "Tempo in beats per minute"]
    ];
    // compilations can have different artists for each track, otherwise use the release artist
    const tracklistWithArtists = tracklist.map((track) => {
        return {
            ...track,
            artists: track.artists?.length > 0 ? track.artists : artists,
        }
    })
    return(
        <div id="tracklist" className="row">
            <h3>Tracklist</h3>
            <div className="table-responsive">
                <table id="tltable" className="table">
                    <thead>
                        {headings.map((h) => (<td className={h} key={h}>{h}</td>))}
                        {detailedHeadings.map(([short, full]) => (
                            <td className={`${short} center`} title={full} key={short}>{short}</td>
                        ))}
                    </thead>
                <tbody>
                    {tracklistWithArtists.map((track) => <DiscogsTrack {...track} />)}
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
                {track.spotifyId && <a href={`https://open.spotify.com/track/${track.spotifyId}`} target="_blank" rel="noopener noreferrer" className="sp">Spotify</a>}
            </td>
            {track.spotifyId ? (
                <>
                    <td className="center">{keys[track.key]} {mode[track.mode]}</td>
                    <td className="center">{track.time_signature}</td>
                    <td className="center">{track.tempo}</td>
                </>
            ) : (
                <td colSpan={3} className="no-data center">Sorry - No metadata found!</td>
            )}
        </tr>
    )
};

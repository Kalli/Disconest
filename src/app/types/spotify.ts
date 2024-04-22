// based on https://github.com/spotify/spotify-web-api-ts-sdk/blob/main/src/types.ts

export interface Album extends AlbumBase {
    artists: Artist[]
    tracks: Page<SimplifiedTrack>
}

export interface AlbumWithAudioFeatures {
    artists: Artist[]
    tracks: Page<TrackWithAudioFeatures>
}

export interface Artist extends SimplifiedArtist {
    followers: Followers
    genres: string[]
    images: Image[]
    popularity: number
}

export interface AudioFeatures {
    danceability: number
    energy: number
    key?: number
    // we need to replace key with musicalKey because "key" is a reserved word in JSX
    musicalKey?: string
    loudness: number
    mode: number
    speechiness: number
    acousticness: number
    instrumentalness: number
    liveness: number
    valence: number
    tempo: number
    type: string
    id: string
    uri: string
    track_href: string
    analysis_url: string
    duration_ms: number
    time_signature: number
}

export interface AudioFeaturesCollection {
    audio_features: AudioFeatures[]
}

export interface Copyright {
    text: string
    type: string
}

export interface ExternalIds {
    upc: string
}

export interface ExternalUrls {
    spotify: string
}

export interface Followers {
    href: string | null
    total: number
}

export interface Image {
    url: string
    height: number
    width: number
}

export interface LinkedFrom {
    external_urls: ExternalUrls
    href: string
    id: string
    type: string
    uri: string
}

export interface Page<TItemType> {
    href: string
    items: TItemType[]
    limit: number
    next: string | null
    offset: number
    previous: string | null
    total: number
}

export interface Restrictions {
    reason: string
}

export interface SearchResultsMap {
    albums: Page<SimplifiedAlbum>
    // we only care about the album
    // artist: Artist
    // track: Track
    // playlist: SimplifiedPlaylist
    // show: SimplifiedShow
    // episode: SimplifiedEpisode
    // audiobook: SimplifiedAudiobook
}

export interface SimplifiedAlbum extends AlbumBase {
    album_group: string
    artists: SimplifiedArtist[]
}

export interface SimplifiedTrack {
    artists: SimplifiedArtist[]
    available_markets: string[]
    disc_number: number
    duration_ms: number
    episode: boolean
    explicit: boolean
    external_urls: ExternalUrls
    href: string
    id: string
    is_local: boolean
    name: string
    preview_url: string | null
    track: boolean
    track_number: number
    type: string
    uri: string
    is_playable?: boolean
    linked_from?: LinkedFrom
    restrictions?: Restrictions
}

export interface SimplifiedArtist {
    external_urls: ExternalUrls
    href: string
    id: string
    name: string
    type: string
    uri: string
}

export type TrackWithAudioFeatures = SimplifiedTrack & AudioFeatures

interface AlbumBase {
    album_type: string
    available_markets: string[]
    copyrights: Copyright[]
    external_ids: ExternalIds
    external_urls: ExternalUrls
    genres: string[]
    href: string
    id: string
    images: Image[]
    label: string
    name: string
    popularity: number
    release_date: string
    release_date_precision: string
    restrictions?: Restrictions
    total_tracks: number
    type: string
    uri: string
}
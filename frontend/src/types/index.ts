export interface User {
    id: number;
    username: string;
    profile_image: string | null;
    stage_name: string | null;
    first_release: string | null;
    biography: string | null;
    location: string | null;
    homepage: string | null;
}

export interface Song {
    id: number;
    name: string;
    artist_id: number;
    genre: string | null;
    thumb_url: string | null;
    song_ref: string;
    created_at: string;
    updated_at: string;
    artist?: User;
}

export interface Playlist {
    id: number;
    name: string;
    user_id: number;
    thumbnail: string | null;
    created_at: string;
    updated_at: string;
    songs?: Song[];
}

// API responses
export interface FeaturedArtistsResponse {
    data: User[];
}

export interface NewReleasesResponse {
    data: Song[];
}

export interface UserPlaylistsResponse {
    playlists: Playlist[];
}
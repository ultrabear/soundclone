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
	created_at?: string;
	updated_at?: string;
}

export interface Playlist {
	id: number;
	name: string;
	user_id: number;
	thumbnail: string | null;
	created_at?: string;
	updated_at?: string;
}

export interface Comment {
	id: number;
	song_id: number;
	author_id: number;
	comment_text: string;
	created_at?: string;
	updated_at?: string;
}

export interface SongWithUser extends Song {
	user: {
		id: number;
		username: string;
		stage_name: string | null;
		profile_image: string | null;
	};
}

export interface PlaylistWithUser extends Playlist {
	user: {
		id: number;
		username: string;
		profile_image: string | null;
		stage_name: string | null;
	};
	songs?: SongWithUser[];
}

export interface CommentWithUser extends Comment {
	user: {
		id: number;
		username: string;
		profile_image: string | null;
	};
}

// API response types
export interface FeaturedArtistsResponse {
	data: User[];
}

export interface NewReleasesResponse {
	data: Song[];
}

export interface UserPlaylistsResponse {
	playlists: Playlist[];
}

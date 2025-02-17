export type CommentId = number;
export type SongId = number;
export type UserId = number;
export type PlaylistId = number;
export type Url = string;
// R stands for redux
export type RSet<T extends string | number | symbol> = Record<T, null>;

export interface Timestamps {
	created_at: Date;
	updated_at: Date;
}

export interface WeakTimestamps {
	created_at: string;
	updated_at: string;
}

export const upgradeTimeStamps = <T extends WeakTimestamps>(obj: T): T => {
	return obj;
};

export interface StoreComment extends WeakTimestamps {
	id: CommentId;
	text: string;
	song_id: SongId;
	author_id: UserId;
}

export interface User {
	id: UserId;
	display_name: string;
	profile_image?: Url;
	first_release?: string;
	biography?: string;
	location?: string;
	homepage_url?: Url;
	num_songs_by_artist?: number;
}

export interface SessionUser {
	id: UserId;
	username: string;
	email: string;
}

export interface Song extends WeakTimestamps {
	id: SongId;
	name: string;
	artist_id: UserId;
	likes: number;
	genre?: string;
	thumb_url?: Url;
	song_url: Url;
}

export interface Playlist extends WeakTimestamps {
	id: PlaylistId;
	name: string;
	user_id: UserId;
	thumbnail?: Url;
	songs: Record<SongId, null>;
}

export interface BasePlaylist {
	name: string;
	thumbnail?: string;
	user_id?: UserId;
}

export interface UserSlice {
	users: Record<UserId, User>;
}

// imports userSlice
export interface SessionSlice {
	user: SessionUser | null;
	likes: Record<SongId, null>;
}

export interface CommentsSlice {
	comments: Record<CommentId, StoreComment>;
}

// imports commentsSlice
// imports userSlice
export interface SongSlice {
	songs: Record<SongId, Song>;
}

// imports songSlice
export interface PlaylistSlice {
	playlists: Record<PlaylistId, Playlist>;
}

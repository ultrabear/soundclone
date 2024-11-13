export type CommentId = number & { readonly __tag: unique symbol };
export type SongId = number & { readonly __tag: unique symbol };
export type UserId = number & { readonly __tag: unique symbol };
export type PlaylistId = number & { readonly __tag: unique symbol };
export type Url = string;
// R stands for redux
export type RSet<T extends string | number | symbol> = Record<T, null>;
export type RMap<K extends string | number | symbol, V> = Record<K, V>;

export interface Timestamps {
	created_at: Date;
	updated_at: Date;
}

export interface StoreComment {
	id: CommentId;
	text: string;
	song_id: SongId;
	author_id: UserId;
}

export interface User {
	id: UserId;
	display_name: string;
	profile_image?: Url;
	first_release?: Date;
	biography?: string;
	location?: string;
	homepage_url?: Url;
}

export interface SessionUser {
	id: UserId;
	username: string;
	email: string;
}

export interface Song extends Timestamps {
	id: SongId;
	name: string;
	artist_id: UserId;
	likes: number;
	genre?: string;
	thumb_url?: Url;
	song_url: Url;
}

export interface Playlist extends Timestamps {
	id: PlaylistId;
	name: string;
	user_id: UserId;
	thumbnail?: Url;
	songs: RSet<SongId>;
}

export interface UserSlice {
	users: RMap<UserId, User>;
}

export interface SessionSlice {
	user: SessionUser | null;
	likes: RSet<SongId>;
}

export interface CommentsSlice {
	comments: RMap<CommentId, StoreComment>;
}

export interface SongSlice {
	songs: RMap<SongId, Song>;
	comments: RMap<SongId, RSet<CommentId>>;
}

export interface PlaylistSlice {
	playlists: RMap<PlaylistId, Playlist>;
}

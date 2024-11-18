type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

export const RequireAuth = Symbol("RequireAuth");

function endpoint<_Request, _Return>(
	_method: HttpMethod | HttpMethod[],
	_route: string,
	_extras?: {
		RequireAuth?: typeof RequireAuth;
	},
) {}

export type Id = { id: number };
export type SongId = number;
export type Timestamps = { created_at: string; updated_at: string };

export type ApiError = {
	message: string;
	errors: Record<string, string>;
};

export type FlaskError = {
	[key: string]: string[];
};

export type Song = {
	name: string;
	artist_id: number;
	genre?: string;
};

export type GetSong = Song &
	Id &
	Timestamps & {
		song_ref: string;
		thumb_url: string;
		num_likes: number;
		artist: { id: number; display_name: string };
	};
export type GetSongs = { songs: GetSong[] };

export type BasePlaylist = {
	name: string;
	thumbnail?: string;
};

export type PlaylistInfo = BasePlaylist & Id & Timestamps;

export type PopulatePlaylist = {
	song_id: number;
};

export type ListOfPlaylist = {
	playlists: (BasePlaylist & Id & Timestamps)[];
};

export type Comment = {
	text: string;
};

export type UserComment = Comment &
	Id &
	Timestamps & {
		user: { id: number; display_name: string };
	};

export type GetComments = { comments: UserComment[] };

export type BaseArtist = {
	profile_image?: string;
	first_release?: string;
	biography?: string;
	location?: string;
	homepage?: string;
	num_songs_by_artist: number;
};

export type Artist = Id &
	BaseArtist & {
		stage_name: string;
	};

export type PostArtist = BaseArtist & {
	stage_name?: string;
};

export type User = {
	id: number;
	username: string;
	email: string;
	profile_image?: string;
	stage_name?: string;
	first_release?: string;
	biography?: string;
	location?: string;
	homepage?: string;
};

export interface ApiUser {
	id: number;
	username: string;
	email: string;
	stage_name?: string;
	profile_image?: string;
	first_release?: string;
	biography?: string;
	location?: string;
	homepage?: string;
	num_songs_by_artist?: number;
}

export type Login = {
	email: string;
	password: string;
};

export type Signup = { username: string; email: string; password: string };

export type SearchResultType = "song" | "artist" | "playlist";

export type SearchResult = {
	type: SearchResultType;
	id: number;
	name: string;
	thumb_url: string | null;
	artist_name: string | null;
};

export type SearchResponse = {
	results: SearchResult[];
};

//endpoint definitions
endpoint<Song, Id & Timestamps>("POST", "/api/songs", { RequireAuth });
endpoint<Song, Id & Timestamps>("PUT", "/api/songs/:song_id", { RequireAuth });
endpoint<void, void>("DELETE", "/api/songs/:song_id", { RequireAuth });
endpoint<void, GetSong>("GET", "/api/songs/:song_id");
endpoint<void, GetSongs>("GET", "/api/songs");
endpoint<BasePlaylist, Id & Timestamps>("POST", "/api/playlists", {
	RequireAuth,
});
endpoint<BasePlaylist, Id & Timestamps>("PUT", "/api/playlists/:playlist_id", {
	RequireAuth,
});
endpoint<void, PlaylistInfo>("GET", "/api/playlists/:playlist_id", {
	RequireAuth,
});
endpoint<void, void>("DELETE", "/api/playlists/:playlist_id", { RequireAuth });
endpoint<PopulatePlaylist, void>(
	["DELETE", "POST"],
	"/api/playlists/:playlist_id/songs",
	{ RequireAuth },
);
endpoint<void, GetSongs>("GET", "/api/playlists/:playlist_id/songs", {
	RequireAuth,
});
endpoint<void, ListOfPlaylist>("GET", "/api/playlists/current", {
	RequireAuth,
});
endpoint<void, GetSongs>("GET", "/api/likes", { RequireAuth });
endpoint<Comment, Id & Timestamps>("POST", "/api/songs/:song_id/comments", {
	RequireAuth,
});
endpoint<Comment, Id & Timestamps>("PUT", "/api/comments/:comment_id", {
	RequireAuth,
});
endpoint<void, void>("DELETE", "/api/comments/:comment_id", { RequireAuth });
endpoint<void, GetComments>("GET", "/api/songs/:song_id/comments");
endpoint<void, void>(["POST", "DELETE"], "/api/songs/:song_id/likes", {
	RequireAuth,
});
endpoint<void, Artist>("GET", "/api/artists/:artist_id");
endpoint<PostArtist, PostArtist & Timestamps>("POST", "/api/artists", {
	RequireAuth,
});
endpoint<void, User>("GET", "/api/auth");
endpoint<Login, User>("POST", "/api/auth/login");
endpoint<Signup, User>("POST", "/api/auth/signup");
endpoint<void, void>("GET", "/api/auth/logout");

// API Implementation
const BASE_URL = "/api";

type FPromise<T = null> = Promise<T | null>;

declare global {
	export interface Error {
		api?: ApiError;
		flaskError?: FlaskError;
	}
}

async function fetchWithError<T>(
	url: string,
	options: RequestInit = {},
): FPromise<T> {
	const response = await fetch(`${BASE_URL}${url}`, {
		...options,
		headers: {
			"Content-Type": "application/json",
			...options.headers,
		},
		credentials: "include",
	});

	if (!response.ok) {
		const e = new Error("API Error");
		const error = await response.json();
		e.api = error;
		e.flaskError = error;

		throw e;
	}

	try {
		return await response.json();
	} catch (_) {
		return null;
	}
}

async function fetchWithErrNoJson<T>(
	url: string,
	options: RequestInit = {},
): FPromise<T> {
	const response = await fetch(`${BASE_URL}${url}`, {
		...options,
		credentials: "include",
	});

	if (!response.ok) {
		const e = new Error("API Error");
		e.api = await response.json();
		throw e;
	}

	try {
		return await response.json();
	} catch (_) {
		return null;
	}
}

function notNull<T>(p: Promise<T | null>): Promise<T> {
	//@ts-expect-error this is intentional
	return p;
}

//API Methods
export const api = {
	songs: {
		getAll: async (): Promise<GetSongs> => {
			return notNull(fetchWithError("/songs"));
		},
		getByArtist: async (artistId: number): Promise<GetSongs> => {
			return notNull(fetchWithError(`/songs?artist_id=${artistId}`));
		},
		getOne: async (songId: number): Promise<GetSong> => {
			return notNull(fetchWithError(`/songs/${songId}`));
		},
		create: async (songData: FormData): Promise<Id & Timestamps> => {
			return notNull(
				fetchWithErrNoJson("/songs", {
					method: "POST",
					body: songData,
				}),
			);
		},
		update: async (songId: number, song: FormData): FPromise => {
			return fetchWithErrNoJson(`/songs/${songId}`, {
				method: "PUT",
				body: song,
			});
		},
		delete: async (songId: number): FPromise => {
			return fetchWithError(`/songs/${songId}`, {
				method: "DELETE",
			});
		},
	},
	artists: {
		getOne: async (artistId: number): Promise<Artist> => {
			return notNull(fetchWithError(`/artists/${artistId}`));
		},
		update: async (artist: FormData): Promise<PostArtist & Timestamps> => {
			return notNull(
				fetchWithErrNoJson("/artists", {
					method: "POST",
					body: artist,
				}),
			);
		},
	},

	auth: {
		login: async (credentials: Login): Promise<User> => {
			return notNull(
				fetchWithError("/auth/login", {
					method: "POST",
					body: JSON.stringify(credentials),
				}),
			);
		},
		signup: async (userData: Signup): Promise<User> => {
			return notNull(
				fetchWithError("/auth/signup", {
					method: "POST",
					body: JSON.stringify(userData),
				}),
			);
		},
		logout: async (): FPromise => {
			return fetchWithError("/auth/logout");
		},
		restore: async (): Promise<User> => {
			return notNull(fetchWithError("/auth"));
		},
	},
	likes: {
		getAll: async (): Promise<GetSongs> => {
			return notNull(fetchWithError("/likes"));
		},
		toggleLike: async (songId: number, method: "POST" | "DELETE"): FPromise => {
			return fetchWithError(`/songs/${songId}/likes`, { method });
		},
	},
	comments: {
		getForSong: async (songId: number): Promise<GetComments> => {
			return notNull(fetchWithError(`/songs/${songId}/comments`));
		},
		create: async (
			songId: number,
			comment: Comment,
		): Promise<Id & Timestamps> => {
			return notNull(
				fetchWithError(`/songs/${songId}/comments`, {
					method: "POST",
					body: JSON.stringify(comment),
				}),
			);
		},
		update: async (
			commentId: number,
			comment: Comment,
		): Promise<Id & Timestamps> => {
			return notNull(
				fetchWithError(`/comments/${commentId}`, {
					method: "PUT",
					body: JSON.stringify(comment),
				}),
			);
		},
		delete: async (commentId: number): FPromise => {
			return fetchWithError(`/comments/${commentId}`, {
				method: "DELETE",
			});
		},
	},
	playlists: {
		getOne: async (playlistId: number): Promise<PlaylistInfo> => {
			return notNull(fetchWithError(`/playlists/${playlistId}`));
		},
		/**
		 * Returns the current users playlists
		 */
		getCurrent: async (): Promise<ListOfPlaylist> => {
			return notNull(fetchWithError("/playlists/current"));
		},
		create: async (playlist: FormData): Promise<Id & Timestamps> => {
			return notNull(
				fetchWithErrNoJson("/playlists", {
					method: "POST",
					body: playlist,
				}),
			);
		},
		update: async (
			playlistId: number,
			playlist: FormData,
		): Promise<BasePlaylist> => {
			return notNull(
				fetchWithErrNoJson(`/playlists/${playlistId}`, {
					method: "PUT",
					body: playlist,
				}),
			);
		},
		delete: async (playlistId: number): FPromise => {
			return fetchWithError(`/playlists/${playlistId}`, {
				method: "DELETE",
			});
		},
		getSongs: async (playlistId: number): Promise<GetSongs> => {
			return notNull(fetchWithError(`/playlists/${playlistId}/songs`));
		},
		addSong: async (playlistId: number, songId: number): FPromise => {
			return fetchWithError(`/playlists/${playlistId}/songs`, {
				method: "POST",
				body: JSON.stringify({ song_id: songId }),
			});
		},
		removeSong: async (playlistId: number, songId: number): FPromise => {
			return fetchWithError(`/playlists/${playlistId}/songs`, {
				method: "DELETE",
				body: JSON.stringify({ song_id: songId }),
			});
		},
	},

	search: {
		query: async (query: string): Promise<SearchResponse> => {
			return notNull(fetchWithError(`/search?q=${encodeURIComponent(query)}`));
		},
	},
};

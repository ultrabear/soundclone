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

export type Song = {
	name: string;
	artist_id: string;
	genre?: string;
	thumb_url?: string;
	song_ref: string;
};

export type GetSong = Song & Id & Timestamps;
export type GetSongs = { songs: GetSong[] };

export type BasePlaylist = {
	name: string;
	thumbnail?: string;
};

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
		user_id: number;
	};

export type GetComments = { comments: UserComment[] };

export type BaseArtist = {
	profile_image?: string;
	first_release?: string;
	biography?: string;
	location?: string;
	homepage?: string;
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

export type Login = {
	email: string;
	password: string;
};

export type Signup = { username: string; email: string; password: string };

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
endpoint<PostArtist, void>("POST", "/api/artists", { RequireAuth });
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
		e.api = await response.json();
		throw e;
	}

	try {
		return await response.json();
	} catch (_) {
		return null;
	}
}

//API Methods
export const api = {
	songs: {
		getAll: async (): FPromise<GetSongs> => {
			return fetchWithError("/songs");
		},
		getByArtist: async (artistId: number): FPromise<GetSongs> => {
			return fetchWithError(`/songs?artist_id=${artistId}`);
		},
		getOne: async (songId: number): FPromise<GetSong> => {
			return fetchWithError(`/songs/${songId}`);
		},
		create: async (song: Song): FPromise<Id & Timestamps> => {
			return fetchWithError("/songs", {
				method: "POST",
				body: JSON.stringify(song),
			});
		},
		update: async (songId: number, song: Song): FPromise<null> => {
			return fetchWithError(`/songs/${songId}`, {
				method: "PUT",
				body: JSON.stringify(song),
			});
		},
		delete: async (songId: number): FPromise<null> => {
			return fetchWithError(`/songs/${songId}`, {
				method: "DELETE",
			});
		},
	},
	users: {
		getOne: async (userId: number): FPromise<User> => {
			return fetchWithError(`/users/${userId}`);
		},
	},
	artists: {
		getOne: async (artistId: number): FPromise<Artist> => {
			return fetchWithError(`/artists/${artistId}`);
		},
	},
	auth: {
		login: async (credentials: Login): FPromise<User> => {
			return fetchWithError("/auth/login", {
				method: "POST",
				body: JSON.stringify(credentials),
			});
		},
		signup: async (userData: Signup): FPromise<User> => {
			return fetchWithError("/auth/signup", {
				method: "POST",
				body: JSON.stringify(userData),
			});
		},
		logout: async (): FPromise => {
			return fetchWithError("/auth/logout");
		},
		restore: async (): FPromise<User> => {
			return fetchWithError("/auth");
		},
	},
	likes: {
		getAll: async (): FPromise<GetSongs> => {
			return fetchWithError("/likes");
		},
		toggleLike: async (
			songId: number,
			method: "POST" | "DELETE",
		): FPromise<null> => {
			return fetchWithError(`/songs/${songId}/likes`, { method });
		},
	},
	comments: {
		getForSong: async (songId: number): FPromise<GetComments> => {
			return fetchWithError(`/songs/${songId}/comments`);
		},
		create: async (
			songId: number,
			comment: Comment,
		): FPromise<Id & Timestamps> => {
			return fetchWithError(`/songs/${songId}/comments`, {
				method: "POST",
				body: JSON.stringify(comment),
			});
		},
		update: async (
			commentId: number,
			comment: Comment,
		): FPromise<Id & Timestamps> => {
			return fetchWithError(`/comments/${commentId}`, {
				method: "PUT",
				body: JSON.stringify(comment),
			});
		},
		delete: async (commentId: number): FPromise<null> => {
			return fetchWithError(`/comments/${commentId}`, {
				method: "DELETE",
			});
		},
	},
	playlists: {
		getCurrent: async (): FPromise<ListOfPlaylist> => {
			return fetchWithError("/playlists/current");
		},
		create: async (playlist: BasePlaylist): FPromise<Id & Timestamps> => {
			return fetchWithError("/playlists", {
				method: "POST",
				body: JSON.stringify(playlist),
			});
		},
		update: async (
			playlistId: number,
			playlist: BasePlaylist,
		): FPromise<null> => {
			return fetchWithError(`/playlists/${playlistId}`, {
				method: "PUT",
				body: JSON.stringify(playlist),
			});
		},
		delete: async (playlistId: number): FPromise<null> => {
			return fetchWithError(`/playlists/${playlistId}`, {
				method: "DELETE",
			});
		},
		getSongs: async (playlistId: number): FPromise<GetSongs> => {
			return fetchWithError(`/playlists/${playlistId}/songs`);
		},
		addSong: async (playlistId: number, songId: number): FPromise<null> => {
			return fetchWithError(`/playlists/${playlistId}/songs`, {
				method: "POST",
				body: JSON.stringify({ song_id: songId }),
			});
		},
		removeSong: async (playlistId: number, songId: number): FPromise<null> => {
			return fetchWithError(`/playlists/${playlistId}/songs`, {
				method: "DELETE",
				body: JSON.stringify({ song_id: songId }),
			});
		},
	},
};

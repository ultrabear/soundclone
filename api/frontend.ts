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

export type Song = {
	name: string;
	artist_id: string;
	genre?: string;
	thumb_url?: string;
	song_ref: string;
};

endpoint<Song, Id & Timestamps>("POST", "/api/songs", { RequireAuth });
endpoint<Song, Id & Timestamps>("PUT", "/api/songs/:song_id", { RequireAuth });
endpoint<void, void>("DELETE", "/api/songs/:song_id", { RequireAuth });
// no data

export type GetSong = Song & Id & Timestamps;
endpoint<void, GetSong>("GET", "/api/songs/:song_id");

export type GetSongs = { songs: GetSong[] };
endpoint<void, GetSongs>("GET", "/api/songs");

export type BasePlaylist = {
	name: string;
	thumbnail?: string;
};

endpoint<BasePlaylist, Id & Timestamps>("POST", "/api/playlists", {
	RequireAuth,
});
endpoint<BasePlaylist, Id & Timestamps>("PUT", "/api/playlists/:playlist_id", {
	RequireAuth,
});

endpoint<void, void>("DELETE", "/api/playlists/:playlist_id", { RequireAuth });

export type PopulatePlaylist = {
	song_id: number;
};
endpoint<PopulatePlaylist, void>(
	["DELETE", "POST"],
	"/api/playlists/:playlist_id/songs",
	{
		RequireAuth,
	},
);

endpoint<void, GetSongs>("GET", "/api/playlists/:playlist_id/songs", {
	RequireAuth,
});
// no data

export type ListOfPlaylist = {
	playlists: (BasePlaylist & Id & Timestamps)[];
};
endpoint<void, ListOfPlaylist>("GET", "/api/playlists/current", {
	RequireAuth,
});

endpoint<void, GetSongs>("GET", "/api/likes", { RequireAuth });

export type Comment = {
	text: string;
};
endpoint<Comment, Id & Timestamps>("POST", "/api/songs/:song_id/comments", {
	RequireAuth,
});
endpoint<Comment, Id & Timestamps>("PUT", "/api/comments/:comment_id", {
	RequireAuth,
});

endpoint<void, void>("DELETE", "/api/comments/:comment_id", { RequireAuth });

export type UserComment = Comment &
	Id &
	Timestamps & {
		user_id: number;
	};

export type GetComments = { comments: UserComment[] };

endpoint<void, GetComments>("GET", "/api/songs/:song_id/comments");

endpoint<void, void>(["POST", "DELETE"], "/api/songs/:song_id/likes", {
	RequireAuth,
});

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
endpoint<void, Artist>("GET", "/api/artists/:artist_id");

export type PostArtist = BaseArtist & {
	stage_name?: string;
};
endpoint<PostArtist, void>("POST", "/api/artists", { RequireAuth });

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

endpoint<void, User>("GET", "/api/auth");
endpoint<Login, User>("POST", "/api/auth/login");
endpoint<Signup, User>("POST", "/api/auth/signup");
endpoint<void, void>("GET", "/api/auth/logout");

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

export const RequireAuth = Symbol("RequireAuth");

function endpoint<_Return>(
	_method: HttpMethod | HttpMethod[],
	_route: string,
	_extras?: {
		RequireAuth?: typeof RequireAuth;
	},
) {}

export type Id = { id: number };

export type SongId = number;

export type Timestamps = { created_at: string; updated_at: string };

endpoint<Id & Timestamps>("POST", "/api/songs", { RequireAuth });
endpoint<Id & Timestamps>("PUT", "/api/songs/:song_id", { RequireAuth });
export type Song = {
	name: string;
	artist_id: string;
	genre?: string;
	thumb_url?: string;
	song_ref: string;
};

endpoint("DELETE", "/api/songs/:song_id", { RequireAuth });
// no data

export type GetSong = Song & Id & Timestamps;
endpoint<GetSong>("GET", "/api/songs/:song_id");

export type GetSongs = { songs: GetSong[] };
endpoint<GetSongs>("GET", "/api/songs");

endpoint<Id & Timestamps>("POST", "/api/playlists", {RequireAuth});
endpoint<Id & Timestamps>("PUT", "/api/playlists/:playlist_id", {RequireAuth});
export type BasePlaylist = {
	name: string;
	thumbnail?: string;
};

endpoint<void>("DELETE", "/api/playlists/:playlist_id", {RequireAuth});
// no data

endpoint<void>(["DELETE", "POST"], "/api/playlists/:playlist_id/songs", {RequireAuth});
export type PopulatePlaylist = {
	song_id: number;
};

endpoint<GetSongs>("GET", "/api/playlists/:playlist_id/songs", { RequireAuth })
// no data


export type ListOfPlaylist = {
	playlists: (BasePlaylist & Id & Timestamps)[]
}
endpoint<ListOfPlaylist>("GET", "/api/playlists/current", {RequireAuth})


endpoint<GetSongs>("GET", "/api/likes", { RequireAuth })

endpoint<Id &Timestamps>("POST", "/api/songs/:song_id/comments", {RequireAuth});
endpoint<Id & Timestamps>("PUT", "/api/comments/:comment_id", {RequireAuth});
export type Comment = {
	text: string;
};

endpoint<void>("DELETE", "/api/comments/:comment_id");
// no data



endpoint<void>(["POST", "DELETE"], "/api/songs/:song_id/likes")
// no data




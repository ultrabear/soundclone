import {
	type PayloadAction,
	createAsyncThunk,
	createSlice,
	createSelector,
} from "@reduxjs/toolkit";
import type { RootState } from "..";
import type { BasePlaylist, Id, Timestamps } from "../api";
import { api } from "../api";
import type {
	Playlist,
	PlaylistId,
	PlaylistSlice,
	SongId,
	UserId,
} from "./types";
import { upgradeTimeStamps } from "./types";
import { apiSongToStore, songsSlice } from "./songsSlice";
import { usersSlice } from "./userSlice";

const initialState: PlaylistSlice = {
	playlists: {},
};

function apiPlaylistToStore(
	p: BasePlaylist & Id & Timestamps & { user_id?: UserId },
	user_id: UserId,
	songs: SongId[],
): Playlist {
	return upgradeTimeStamps({
		...p,
		user_id: p.user_id || user_id,
		songs: Object.fromEntries(songs.map((s) => [s, null])),
	});
}

export const fetchUserPlaylists = createAsyncThunk(
	"playlists/fetchUserPlaylists",
	async (_: undefined, { dispatch, getState }) => {
		const state = getState() as RootState;
		const sessionUser = state.session.user!.id;

		const playlist = await api.playlists.getCurrent();

		const songsPlaylists = await Promise.all(
			playlist.playlists.map((p) =>
				(async () => ({ p: p, s: await api.playlists.getSongs(p.id) }))(),
			),
		);

		dispatch(
			playlistsSlice.actions.addPlaylists(
				songsPlaylists.map((p) =>
					apiPlaylistToStore(
						p.p,
						sessionUser,
						p.s.songs.map((s) => s.id),
					),
				),
			),
		);

		const songs = songsPlaylists.flatMap(({ s }) => s.songs);

		dispatch(songsSlice.actions.addSongs(songs.map(apiSongToStore)));
		dispatch(usersSlice.actions.partialAddUsers(songs.map((s) => s.artist)));
	},
);

export const fetchPlaylist = createAsyncThunk(
	"playlists/fetchPlaylist",
	async (id: number, { dispatch, getState }) => {
		const state = getState() as RootState;
		const sessionUser = state.session.user!.id;

		const [playlist, songs] = await Promise.all([
			api.playlists.getOne(id),
			api.playlists.getSongs(id),
		]);

		dispatch(
			playlistsSlice.actions.addPlaylist(
				apiPlaylistToStore(
					playlist,
					sessionUser,
					songs.songs.map((s) => s.id),
				),
			),
		);
		dispatch(songsSlice.actions.addSongs(songs.songs.map(apiSongToStore)));

		dispatch(
			usersSlice.actions.partialAddUsers(songs.songs.map((s) => s.artist)),
		);
	},
);

export const addSongToPlaylistThunk = createAsyncThunk(
	"playlists/addSong",
	async (
		{ playlist, song }: { playlist: PlaylistId; song: SongId },
		{ dispatch },
	) => {
		await api.playlists.addSong(playlist, song);
		dispatch(
			playlistsSlice.actions.addSongToPlaylist({
				playlist,
				song,
			}),
		);
	},
);

export const selectMyPlaylists = createSelector(
	[
		(state: RootState) => state.playlist.playlists,
		(state: RootState) => state.session.user?.id,
	],
	(playlists, userId) => {
		return Object.values(playlists).filter((p) => p.user_id === userId);
	},
);

export const playlistsSlice = createSlice({
	name: "playlists",
	initialState,
	reducers: {
		addPlaylists: (state, action: PayloadAction<Playlist[]>) => {
			for (const p of action.payload) {
				state.playlists[p.id] = p;
			}
		},

		addPlaylist: (state, action: PayloadAction<Playlist>) => {
			state.playlists[action.payload.id] = action.payload;
		},

		addSongToPlaylist: (
			state,
			action: PayloadAction<{ playlist: PlaylistId; song: SongId }>,
		) => {
			const { playlist, song } = action.payload;
			const list = state.playlists[playlist]?.songs;
			if (list != null && song in list) {
				list[song] = null;
			}
		},

		removeSongFromPlaylist: (
			state,
			action: PayloadAction<{ playlist: PlaylistId; song: SongId }>,
		) => {
			const { playlist, song } = action.payload;
			const list = state.playlists[playlist]?.songs;
			if (list !== null) {
				delete list?.[song];
			}
		},

		clearPlaylists: (state) => {
			state.playlists = {};
		},
	},
});

export default playlistsSlice.reducer;

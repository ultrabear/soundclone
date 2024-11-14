import {
	createAsyncThunk,
	createSlice,
	type PayloadAction,
} from "@reduxjs/toolkit";
import {
	type PlaylistSlice,
	type Playlist,
	type PlaylistId,
	type SongId,
	upgradeTimeStamps,
} from "./types";
import type {
	ListOfPlaylist,
	BasePlaylist,
	Id,
	Timestamps,
	GetSongs,
} from "../api";
import { api } from "../api";

const initialState: PlaylistSlice = {
	playlists: {},
};

function apiPlaylistToStore(
	p: BasePlaylist & Id & Timestamps,
	songs: SongId[],
): Playlist {
	return upgradeTimeStamps(p);
}

export const fetchUserPlaylists = createAsyncThunk(
	"playlists/fetchUserPlaylists",
	async () => {
		await api.playlists.getCurrent();
		api.playlists.getSongs();
	},
);

export const fetchPlaylist = createAsyncThunk(
	"playlists/fetchPlaylist",
	async (id: number) => {},
);

export const addSongToPlaylist = createAsyncThunk(
	"playlists/addSong",
	async ({ playlistId, songId }: { playlistId: number; songId: number }) => {},
);

const playlistsSlice = createSlice({
	name: "playlists",
	initialState,
	reducers: {
		addPlaylist: (state, action: PayloadAction<Playlist>) => {
			state.playlists[action.payload.id] = action.payload;
		},

		addSongToPlaylist: (
			state,
			action: PayloadAction<{ playlist: PlaylistId; song: SongId }>,
		) => {
			const { playlist, song } = action.payload;

			const list = state.playlists[playlist]?.songs;

			if (list !== null) {
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
				delete list[song];
			}
		},
	},
});

export default playlistsSlice.reducer;

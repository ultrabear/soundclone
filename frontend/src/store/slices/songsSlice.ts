import {
	createAsyncThunk,
	createSelector,
	createSlice,
} from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { api } from "../api";
import type { GetSong } from "../api";
import {
	type SongSlice,
	type Song,
	type SongId,
	type UserId,
	upgradeTimeStamps,
} from "./types";
import { apiUserToStore, slice as userSlice } from "./userSlice";
import type { RootState } from "..";

const initialState: SongSlice = {
	songs: {},
	comments: {},
};

function apiSongToStore(s: GetSong): Song {
	const { num_likes, song_ref, artist_id, ...rest } = s;

	return upgradeTimeStamps({
		...rest,
		id: s.id as SongId,
		artist_id: artist_id as UserId,
		likes: num_likes,
		song_url: song_ref,
	});
}

export const fetchNewReleases = createAsyncThunk(
	"songs/fetchNewReleases",
	async (_: null, { dispatch }) => {
		const { songs } = (await api.songs.getAll())!;

		const users = await Promise.all(
			songs.map(async (song) => {
				return api.artists.getOne(song.artist_id);
			}),
		);

		const arr = users.filter((v) => v !== null).map(apiUserToStore);

		dispatch(userSlice.actions.addUsers(arr));
		dispatch(songsSlice.actions.addSongs(songs.map(apiSongToStore)));
	},
);

export const selectNewestSongs = createSelector(
	[(state: RootState) => state.song.songs],
	(songs) => {
		const out: Song[] = [];

		for (const k in songs) {
			out.push(songs[k]);
		}

		out.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());

		return out;
	},
);

export const fetchArtistSongs = createAsyncThunk(
	"songs/fetchArtistSongs",
	async (artistId: number, { dispatch }) => {
		const [{ songs }, user] = await Promise.all([
			api.songs.getByArtist(artistId),
			api.artists.getOne(artistId),
		]);

		dispatch(userSlice.actions.addUser(apiUserToStore(user)));
		dispatch(songsSlice.actions.addSongs(songs.map(apiSongToStore)));
	},
);

const songsSlice = createSlice({
	name: "songs",
	initialState,
	reducers: {
		addSongs: (store, action: PayloadAction<Song[]>) => {
			for (const s of action.payload) {
				store.songs[s.id] = s;
			}
		},
	},
});

export default songsSlice.reducer;

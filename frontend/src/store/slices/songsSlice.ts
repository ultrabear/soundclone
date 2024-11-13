import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { api } from "../api";
import type { SongSlice, Song } from "./types";

const initialState: SongSlice = {
	songs: {},
	comments: {},
};

export const fetchNewReleases = createAsyncThunk(
	"songs/fetchNewReleases",
	async () => {
		const { songs } = (await api.songs.getAll())!;
		const songsWithUsers = await Promise.all(
			songs.map(async (song) => {
				const artistId =
					typeof song.artist_id === "string"
						? Number.parseInt(song.artist_id, 10)
						: song.artist_id;
				const user = await api.users.getOne(artistId);
				return transformSongData(song, user);
			}),
		);
		return { data: songsWithUsers };
	},
);

export const fetchArtistSongs = createAsyncThunk(
	"songs/fetchArtistSongs",
	async (artistId: number) => {
		const [{ songs }, user] = await Promise.all([
			api.songs.getByArtist(artistId),
			api.users.getOne(artistId),
		]);

		const songsWithUser = songs.map((song) => transformSongData(song, user));
		return { data: songsWithUser };
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

export const { clearSongs } = songsSlice.actions;
export default songsSlice.reducer;

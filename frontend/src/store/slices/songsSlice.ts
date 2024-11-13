import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { Song, SongWithUser } from "../../types";
import { api } from "../api";
import type { GetSong } from "../api";

interface SongsState {
	newReleases: SongWithUser[];
	artistSongs: SongWithUser[];
	songs: Record<number, Song>;
	loading: boolean;
	error: string | null;
}

const initialState: SongsState = {
	newReleases: [],
	artistSongs: [],
	songs: {},
	loading: false,
	error: null,
};

//transform song data
const transformSongData = (song: GetSong, user: any): SongWithUser => ({
	id: song.id,
	name: song.name,
	artist_id:
		typeof song.artist_id === "string"
			? Number.parseInt(song.artist_id, 10)
			: song.artist_id,
	genre: song.genre ?? null,
	thumb_url: song.thumb_url ?? null,
	song_ref: song.song_ref,
	created_at: song.created_at,
	updated_at: song.updated_at,
	user: {
		id: user.id,
		username: user.username,
		stage_name: user.stage_name ?? null,
		profile_image: user.profile_image ?? null,
	},
});

export const fetchNewReleases = createAsyncThunk(
	"songs/fetchNewReleases",
	async () => {
		const { songs } = await api.songs.getAll();
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
		clearSongs: (state) => {
			state.newReleases = [];
			state.artistSongs = [];
			state.songs = {};
			state.error = null;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchNewReleases.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchNewReleases.fulfilled, (state, action) => {
				state.loading = false;
				state.newReleases = action.payload.data;
				action.payload.data.forEach((song) => {
					const { user, ...songData } = song;
					state.songs[song.id] = songData;
				});
			})
			.addCase(fetchNewReleases.rejected, (state, action) => {
				state.loading = false;
				state.error = action.error.message ?? "Failed to fetch releases";
			})
			.addCase(fetchArtistSongs.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchArtistSongs.fulfilled, (state, action) => {
				state.loading = false;
				state.artistSongs = action.payload.data;
				action.payload.data.forEach((song) => {
					const { user, ...songData } = song;
					state.songs[song.id] = songData;
				});
			})
			.addCase(fetchArtistSongs.rejected, (state, action) => {
				state.loading = false;
				state.error = action.error.message ?? "Failed to fetch artist songs";
			});
	},
});

export const { clearSongs } = songsSlice.actions;
export default songsSlice.reducer;

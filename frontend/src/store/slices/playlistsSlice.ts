// src/store/slices/playlistsSlice.ts
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PlaylistWithUser } from "../../types";

export const mockPlaylistData = {
	id: 1,
	name: "Featured Playlist",
	user_id: 1,
	user: {
		id: 1,
		username: "featured_curator",
		stage_name: "Featured Curator",
		profile_image: null,
	},
	thumbnail:
		"https://upload.wikimedia.org/wikipedia/commons/0/0e/Continuum_by_John_Mayer_%282006%29.jpg",
	songs: [
		{
			id: 1,
			name: "Amazing Song",
			artist_id: 1,
			genre: "Pop",
			thumb_url: "https://example.com/thumb1.jpg",
			song_ref: "song1.mp3",
			user: {
				id: 1,
				username: "artist1",
				stage_name: "Cool Artist",
				profile_image: null,
			},
			created_at: "2024-03-01",
			updated_at: "2024-03-01",
		},
		{
			id: 2,
			name: "Incredible Tune",
			artist_id: 1,
			genre: "Pop",
			thumb_url: "https://example.com/thumb2.jpg",
			song_ref: "song2.mp3",
			user: {
				id: 1,
				username: "artist1",
				stage_name: "Cool Artist",
				profile_image: null,
			},
			created_at: "2024-03-02",
			updated_at: "2024-03-02",
		},
	],
	created_at: "2024-03-01",
	updated_at: "2024-03-01",
};

export const mockPlaylistData2 = {
	id: 2,
	name: "Rock Classics",
	user_id: 2,
	user: {
		id: 2,
		username: "rock_fan",
		stage_name: "Rock Enthusiast",
		profile_image: null,
	},
	thumbnail: "https://example.com/rock_thumbnail.jpg",
	songs: [
		{
			id: 3,
			name: "Rock Anthem",
			artist_id: 2,
			genre: "Rock",
			thumb_url: "https://example.com/thumb3.jpg",
			song_ref: "rock_song1.mp3",
			user: {
				id: 2,
				username: "artist2",
				stage_name: "Rock Star",
				profile_image: null,
			},
			created_at: "2024-04-01",
			updated_at: "2024-04-01",
		},
		{
			id: 4,
			name: "Guitar Hero",
			artist_id: 3,
			genre: "Rock",
			thumb_url: "https://example.com/thumb4.jpg",
			song_ref: "rock_song2.mp3",
			user: {
				id: 3,
				username: "artist3",
				stage_name: "Guitar Legend",
				profile_image: null,
			},
			created_at: "2024-04-02",
			updated_at: "2024-04-02",
		},
	],
	created_at: "2024-04-01",
	updated_at: "2024-04-01",
};

export const mockPlaylistData3 = {
	id: 3,
	name: "Chill Vibes",
	user_id: 3,
	user: {
		id: 3,
		username: "chill_master",
		stage_name: "Chill Master",
		profile_image: null,
	},
	thumbnail: "https://example.com/chill_thumbnail.jpg",
	songs: [
		{
			id: 5,
			name: "Relaxing Tune",
			artist_id: 4,
			genre: "Ambient",
			thumb_url: "https://example.com/thumb5.jpg",
			song_ref: "chill_song1.mp3",
			user: {
				id: 4,
				username: "artist4",
				stage_name: "Ambient Artist",
				profile_image: null,
			},
			created_at: "2024-05-01",
			updated_at: "2024-05-01",
		},
		{
			id: 6,
			name: "Soothing Melody",
			artist_id: 5,
			genre: "Ambient",
			thumb_url: "https://example.com/thumb6.jpg",
			song_ref: "chill_song2.mp3",
			user: {
				id: 5,
				username: "artist5",
				stage_name: "Melody Maker",
				profile_image: null,
			},
			created_at: "2024-05-02",
			updated_at: "2024-05-02",
		},
	],
	created_at: "2024-05-01",
	updated_at: "2024-05-01",
};

export const mockPlaylistData4 = {
	id: 4,
	name: "Hip-Hop Hits",
	user_id: 4,
	user: {
		id: 4,
		username: "hiphop_head",
		stage_name: "Hip-Hop Head",
		profile_image: null,
	},
	thumbnail: "https://example.com/hiphop_thumbnail.jpg",
	songs: [
		{
			id: 7,
			name: "Rap Anthem",
			artist_id: 6,
			genre: "Hip-Hop",
			thumb_url: "https://example.com/thumb7.jpg",
			song_ref: "hiphop_song1.mp3",
			user: {
				id: 6,
				username: "artist6",
				stage_name: "Rapper",
				profile_image: null,
			},
			created_at: "2024-06-01",
			updated_at: "2024-06-01",
		},
		{
			id: 8,
			name: "Urban Beat",
			artist_id: 7,
			genre: "Hip-Hop",
			thumb_url: "https://example.com/thumb8.jpg",
			song_ref: "hiphop_song2.mp3",
			user: {
				id: 7,
				username: "artist7",
				stage_name: "Beat Maker",
				profile_image: null,
			},
			created_at: "2024-06-02",
			updated_at: "2024-06-02",
		},
	],
	created_at: "2024-06-01",
	updated_at: "2024-06-01",
};

export const mockPlaylistData5 = {
	id: 5,
	name: "Electronic Essentials",
	user_id: 5,
	user: {
		id: 5,
		username: "dj_electro",
		stage_name: "DJ Electro",
		profile_image: null,
	},
	thumbnail: "https://example.com/electro_thumbnail.jpg",
	songs: [
		{
			id: 9,
			name: "Dance Beat",
			artist_id: 8,
			genre: "Electronic",
			thumb_url: "https://example.com/thumb9.jpg",
			song_ref: "electro_song1.mp3",
			user: {
				id: 8,
				username: "artist8",
				stage_name: "Electronic Artist",
				profile_image: null,
			},
			created_at: "2024-07-01",
			updated_at: "2024-07-01",
		},
		{
			id: 10,
			name: "Synth Wave",
			artist_id: 9,
			genre: "Electronic",
			thumb_url: "https://example.com/thumb10.jpg",
			song_ref: "electro_song2.mp3",
			user: {
				id: 9,
				username: "artist9",
				stage_name: "Synth Master",
				profile_image: null,
			},
			created_at: "2024-07-02",
			updated_at: "2024-07-02",
		},
	],
	created_at: "2024-07-01",
	updated_at: "2024-07-01",
};

interface PlaylistsState {
	playlists: Record<number, PlaylistWithUser>;
	currentPlaylist: PlaylistWithUser | null;
	userPlaylists: PlaylistWithUser[];
	loading: boolean;
	error: string | null;
}

const initialState: PlaylistsState = {
	playlists: {},
	currentPlaylist: null,
	userPlaylists: [],
	loading: false,
	error: null,
};

export const fetchUserPlaylists = createAsyncThunk(
	"playlists/fetchUserPlaylists",
	async () => {
		// Mock implementation for now
		await new Promise((resolve) => setTimeout(resolve, 500));
		return {
			playlists: [
				mockPlaylistData,
				mockPlaylistData2,
				mockPlaylistData3,
				mockPlaylistData4,
				mockPlaylistData5,
			],
		};
	},
);

export const fetchPlaylist = createAsyncThunk(
	"playlists/fetchPlaylist",
	async (id: number) => {
		// For now return mock data
		await new Promise((resolve) => setTimeout(resolve, 500));
		const playlists = [
			mockPlaylistData,
			mockPlaylistData2,
			mockPlaylistData3,
			mockPlaylistData4,
			mockPlaylistData5,
		];
		const playlist = playlists.find((p) => p.id === id) || mockPlaylistData;
		return { playlist };
	},
);

export const addSongToPlaylist = createAsyncThunk(
	"playlists/addSong",
	async ({ playlistId, songId }: { playlistId: number; songId: number }) => {
		// Mock implementation
		await new Promise((resolve) => setTimeout(resolve, 500));
		return { playlistId, songId };
	},
);

const playlistsSlice = createSlice({
	name: "playlists",
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder
			.addCase(fetchPlaylist.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchPlaylist.fulfilled, (state, action) => {
				state.loading = false;
				const playlist = action.payload.playlist;
				state.playlists[playlist.id] = playlist;
				state.currentPlaylist = playlist;
			})
			.addCase(fetchPlaylist.rejected, (state, action) => {
				state.loading = false;
				state.error = action.error.message ?? "Failed to fetch playlist";
			})
			.addCase(fetchUserPlaylists.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchUserPlaylists.fulfilled, (state, action) => {
				state.loading = false;
				state.userPlaylists = action.payload.playlists;
			})
			.addCase(fetchUserPlaylists.rejected, (state, action) => {
				state.loading = false;
				state.error = action.error.message ?? "Failed to fetch user playlists";
			})
			.addCase(addSongToPlaylist.fulfilled, (_state, _action) => {
				// Implementation for adding song to playlist
			});
	},
});

export default playlistsSlice.reducer;

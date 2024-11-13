import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { Song, SongWithUser } from "../../types";
import { mockArtists } from "./artistsSlice";

// Mock data
export const mockSongs: SongWithUser[] = [
	{
		id: 1,
		name: "Amazing Song",
		artist_id: 1,
		genre: "Pop",
		thumb_url:
			"https://upload.wikimedia.org/wikipedia/commons/0/0e/Continuum_by_John_Mayer_%282006%29.jpg",
		song_ref: "song1.mp3",
		created_at: "2024-03-01",
		updated_at: "2024-03-01",
		user: mockArtists[0], // Reference the first mock artist
	},
	{
		id: 2,
		name: "Cool Track",
		artist_id: 2,
		genre: "Rock",
		thumb_url:
			"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSAuEMNtE9NIc7M1Ldr1REFZZaRLkOSV6IPhQ&s",
		song_ref: "song2.mp3",
		created_at: "2024-03-02",
		updated_at: "2024-03-02",
		user: mockArtists[1],
	},
	{
		id: 3,
		name: "Epic Tune",
		artist_id: 3,
		genre: "Electronic",
		thumb_url:
			"https://archive.smashing.media/assets/344dbf88-fdf9-42bb-adb4-46f01eedd629/aecf4604-1d3b-417f-97c6-d5be80f51eb9/3.jpg",
		song_ref: "song3.mp3",
		created_at: "2024-03-03",
		updated_at: "2024-03-03",
		user: mockArtists[3],
	},
	{
		id: 4,
		name: "Chill Vibes",
		artist_id: 4,
		genre: "Lo-fi",
		thumb_url:
			"https://miro.medium.com/v2/resize:fit:681/1*EBOL4lka5QjcYoxj6AHp-g.png",
		song_ref: "song4.mp3",
		created_at: "2024-03-04",
		updated_at: "2024-03-04",
		user: mockArtists[4],
	},
	{
		id: 5,
		name: "Summer Vibes",
		artist_id: 5,
		genre: "House",
		thumb_url:
			"https://www.billboard.com/wp-content/uploads/2022/03/48.-Lady-Gaga-%E2%80%98The-Fame-Monster-2009-album-art-billboard-1240.jpg?w=600",
		song_ref: "song5.mp3",
		created_at: "2024-03-05",
		updated_at: "2024-03-05",
		user: mockArtists[3],
	},
	{
		id: 6,
		name: "Night Drive",
		artist_id: 6,
		genre: "Synthwave",
		thumb_url:
			"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQLQ0YmwOcndgYU7tcSL7PggPb8ZfXPch8uaA&s",
		song_ref: "song6.mp3",
		created_at: "2024-03-06",
		updated_at: "2024-03-06",
		user: mockArtists[5],
	},
	{
		id: 7,
		name: "Morning Coffee",
		artist_id: 7,
		genre: "Jazz",
		thumb_url:
			"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSAuEMNtE9NIc7M1Ldr1REFZZaRLkOSV6IPhQ&s",
		song_ref: "song7.mp3",
		created_at: "2024-03-07",
		updated_at: "2024-03-07",
		user: mockArtists[2],
	},
];

interface SongsState {
	newReleases: SongWithUser[];
	songs: Record<number, Song>;
	loading: boolean;
	error: string | null;
}

const initialState: SongsState = {
	newReleases: [],
	songs: {},
	loading: false,
	error: null,
};

export const fetchNewReleases = createAsyncThunk(
	"songs/fetchNewReleases",
	async () => {
		await new Promise((resolve) => setTimeout(resolve, 500));
		const songsWithUsers = mockSongs.map((song) => ({
			...song,
			user: mockArtists.find((artist) => artist.id === song.artist_id) || {
				id: song.artist_id,
				username: "Unknown Artist",
				stage_name: null,
				profile_image: null,
				biography: null,
				location: null,
				first_release: null,
				homepage: null,
			},
		}));
		return { data: songsWithUsers };
	},
);

export const createSongThunk = createAsyncThunk(
	"songs",
	async (songData: FormData) => {
		try {
			const response = await fetch("/api/songs", {
				method: "POST",
				body: songData,
			});
			const parsedResponse = await response.json();
			return parsedResponse;
		} catch (serverError: any) {
			const parsedError = await serverError.json();
			return parsedError;
		}
	},
);

const songsSlice = createSlice({
	name: "songs",
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder
			.addCase(fetchNewReleases.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchNewReleases.fulfilled, (state, action) => {
				state.loading = false;
				state.newReleases = action.payload.data;
			})
			.addCase(fetchNewReleases.rejected, (state, action) => {
				state.loading = false;
				state.error = action.error.message ?? "Failed to fetch releases";
			})
			.addCase(createSongThunk.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(createSongThunk.fulfilled, (state, action) => {
				state.loading = false;
				const newSong = action.payload;
				state.songs = { ...state.songs, [newSong.id]: newSong };
			})
			.addCase(createSongThunk.rejected, (state, action) => {
				state.loading = false;
				state.error = action.error.message ?? "Failed to create new song";
			});
	},
});

export default songsSlice.reducer;

import { type PayloadAction, createSlice } from "@reduxjs/toolkit";
import type { SongWithUser } from "../types";

interface PlayerState {
	currentSong: SongWithUser | null;
	isPlaying: boolean;
	queue: SongWithUser[];
	history: SongWithUser[];
	volume: number;
	repeat: "none" | "one" | "all";
	shuffle: boolean;
}

export const mockCurrentSong: SongWithUser = {
	id: 1,
	name: "Amazing Song",
	artist_id: 1,
	genre: "Pop",
	thumb_url:
		"https://upload.wikimedia.org/wikipedia/commons/0/0e/Continuum_by_John_Mayer_%282006%29.jpg",
	song_ref: "song1.mp3",
	created_at: "2024-03-01",
	updated_at: "2024-03-01",
	user: {
		id: 1,
		username: "artist1",
		stage_name: "Cool Artist",
		profile_image:
			"https://media.them.us/photos/663bc34e344e5d57d900f2ee/16:9/w_2560%2Cc_limit/lady-gaga.jpg",
	},
};

const initialState: PlayerState = {
	currentSong: mockCurrentSong,
	isPlaying: false,
	queue: [],
	history: [],
	volume: 1,
	repeat: "none",
	shuffle: false,
};

const playerSlice = createSlice({
	name: "player",
	initialState,
	reducers: {
		setCurrentSong: (state, action: PayloadAction<SongWithUser>) => {
			if (state.currentSong) {
				state.history.push(state.currentSong);
			}
			state.currentSong = action.payload;
			state.isPlaying = true;
		},
		togglePlayPause: (state) => {
			state.isPlaying = !state.isPlaying;
		},
		addToQueue: (state, action: PayloadAction<SongWithUser>) => {
			state.queue.push(action.payload);
		},
		removeFromQueue: (state, action: PayloadAction<number>) => {
			state.queue = state.queue.filter((_, index) => index !== action.payload);
		},
		clearQueue: (state) => {
			state.queue = [];
		},
		setVolume: (state, action: PayloadAction<number>) => {
			state.volume = action.payload;
		},
		toggleRepeat: (state) => {
			const modes: ("none" | "one" | "all")[] = ["none", "one", "all"];
			const currentIndex = modes.indexOf(state.repeat);
			state.repeat = modes[(currentIndex + 1) % modes.length];
		},
		toggleShuffle: (state) => {
			state.shuffle = !state.shuffle;
		},
		playNext: (state) => {
			if (state.currentSong) {
				state.history.push(state.currentSong);
			}
			const nextSong = state.queue.shift();
			if (nextSong) {
				state.currentSong = nextSong;
			}
		},
		playPrevious: (state) => {
			if (state.currentSong) {
				state.queue.unshift(state.currentSong);
			}
			const previousSong = state.history.pop();
			if (previousSong) {
				state.currentSong = previousSong;
			}
		},
	},
});

export const {
	setCurrentSong,
	togglePlayPause,
	addToQueue,
	removeFromQueue,
	clearQueue,
	setVolume,
	toggleRepeat,
	toggleShuffle,
	playNext,
	playPrevious,
} = playerSlice.actions;

export default playerSlice.reducer;

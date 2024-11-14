import { type PayloadAction, createSlice } from "@reduxjs/toolkit";
import type { SongId } from "./slices/types";

interface PlayerState {
	currentSong: SongId | null;
	isPlaying: boolean;
	queue: SongId[];
	history: SongId[];
	volume: number;
	repeat: "none" | "one" | "all";
	shuffle: boolean;
}

const initialState: PlayerState = {
	currentSong: null,
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
		setCurrentSong: (state, action: PayloadAction<SongId>) => {
			if (state.currentSong) {
				state.history.push(state.currentSong);
			}
			state.currentSong = action.payload;
			state.isPlaying = true;
		},
		togglePlayPause: (state) => {
			state.isPlaying = !state.isPlaying;
		},
		addToQueue: (state, action: PayloadAction<SongId>) => {
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

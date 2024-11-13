import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import playerReducer from "./playerSlice";
import sessionReducer from "./session";
import artistsReducer from "./slices/artistsSlice";
import commentsReducer from "./slices/commentsSlice";
import likesReducer from "./slices/likesSlice";
import playlistsReducer from "./slices/playlistsSlice";
import songsReducer from "./slices/songsSlice";

export const store = configureStore({
	reducer: {
		artists: artistsReducer,
		songs: songsReducer,
		playlists: playlistsReducer,
		player: playerReducer,
		session: sessionReducer,
		comments: commentsReducer,
		likes: likesReducer,
	},
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();

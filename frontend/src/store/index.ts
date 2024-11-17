import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import playerReducer from "./playerSlice";
import commentReducer from "./slices/commentsSlice";
import playlistReducer from "./slices/playlistsSlice";
import sessionReducer from "./slices/sessionSlice";
import songReducer from "./slices/songsSlice";
import userReducer from "./slices/userSlice";
import searchReducer from "./slices/searchSlice";

export const store = configureStore({
	reducer: {
		player: playerReducer,
		session: sessionReducer,
		user: userReducer,
		playlist: playlistReducer,
		song: songReducer,
		comment: commentReducer,
		search: searchReducer,
	},
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();

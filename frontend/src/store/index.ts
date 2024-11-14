import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import playerReducer from "./playerSlice";
import sessionReducer from "./slices/sessionSlice";
import userReducer from "./slices/userSlice";
import playlistReducer from "./slices/playlistsSlice";
import songReducer from "./slices/songsSlice";

export const store = configureStore({
	reducer: {
		player: playerReducer,
		session: sessionReducer,
		user: userReducer,
		playlist: playlistReducer,
		song: songReducer,
	},
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();

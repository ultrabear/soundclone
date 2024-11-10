import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import artistsReducer from './slices/artistsSlice';
import songsReducer from './slices/songsSlice';
import playlistsReducer from './slices/playlistsSlice';
import playerReducer from './playerSlice';
import sessionReducer from "./session";

export const store = configureStore({
    reducer: {
        artists: artistsReducer,
        songs: songsReducer,
        playlists: playlistsReducer,
        player: playerReducer,
        session: sessionReducer
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
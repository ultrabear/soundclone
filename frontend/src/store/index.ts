import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import homeReducer from './homeSlice';
import playerReducer from './playerSlice';
import playlistReducer from './playlistSlice';


export const store = configureStore({
    reducer: {
        home: homeReducer,
        player: playerReducer,
        playlist: playlistReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();

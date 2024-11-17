import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "..";
import type { Song } from "../slices/types";

const selectSongs = (state: RootState) => state.song.songs;

export const selectNewestSongs = createSelector(
	[selectSongs],
	(songs): Song[] =>
		Object.values(songs).sort(
			(a, b) =>
				new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
		),
);

export const selectTop10NewestSongs = createSelector(
	[selectNewestSongs],
	(songs): Song[] => songs.slice(0, 10),
);

export const selectSongsByArtist = createSelector(
	[selectSongs, (_: RootState, artistId: number) => artistId],
	(songs, artistId): Song[] =>
		Object.values(songs)
			.filter((song) => song.artist_id === artistId)
			.sort(
				(a, b) =>
					new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
			),
);

export const selectSongById = (
	state: RootState,
	songId: number,
): Song | undefined => selectSongs(state)[songId];

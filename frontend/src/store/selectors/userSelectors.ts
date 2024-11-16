import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "../index";
import type { Playlist, Song } from "../slices/types";

// Selector for user playlists
export const selectUserPlaylists = createSelector(
	[
		(state: RootState) => state.playlist.playlists,
		(state: RootState) => state.session.user?.id,
	],
	(
		playlists: Record<number, Playlist>,
		userId: number | undefined,
	): Playlist[] =>
		userId
			? Object.values(playlists).filter(
					(playlist) => playlist.user_id === userId,
				)
			: [],
);

// Selector for liked songs
export const selectLikedSongs = createSelector(
	[
		(state: RootState) => state.session.likes,
		(state: RootState) => state.song.songs,
	],
	(likes: Record<number, null>, songs: Record<number, Song>): Song[] => {
		return Object.keys(likes)
			.map((id) => songs[Number(id)])
			.filter((song): song is Song => !!song)
			.sort((a, b) => {
				const dateA = new Date(a.created_at).getTime();
				const dateB = new Date(b.created_at).getTime();
				return dateB - dateA;
			});
	},
);

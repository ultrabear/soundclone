import {
	createAsyncThunk,
	createSelector,
	createSlice,
} from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { AppDispatch, RootState } from "..";
import { api } from "../api";
import type { GetSong } from "../api";
import { apiCommentToStore, commentsSlice } from "./commentsSlice";
import { slice as sessionSlice } from "./sessionSlice";
import {
	type RSet,
	type Song,
	type SongId,
	type SongSlice,
	type UserId,
	upgradeTimeStamps,
} from "./types";
import { apiUserToStore, slice as userSlice } from "./userSlice";

const initialState: SongSlice = {
	songs: {},
	comments: {},
};

export function apiSongToStore(s: GetSong): Song {
	const { num_likes, song_ref, artist_id, ...rest } = s;

	return upgradeTimeStamps({
		...rest,
		id: s.id as SongId,
		artist_id: artist_id as UserId,
		likes: num_likes,
		song_url: song_ref,
	});
}

export const getLikes = createAsyncThunk(
	"songs/getLikes",
	async (_: undefined, { dispatch }) => {
		const likes = await api.likes.getAll();

		dispatch(songsSlice.actions.addSongs(likes.songs.map(apiSongToStore)));
		dispatch(sessionSlice.actions.addBulkLikes(likes.songs.map((s) => s.id)));
	},
);

export const likeSong = (songId: SongId) => async (dispatch: AppDispatch) => {
	dispatch(sessionSlice.actions.addLike(songId));
	dispatch(songsSlice.actions.addLike(songId));
	await api.likes.toggleLike(songId, "POST");
};

export const unlikeSong = (songId: SongId) => async (dispatch: AppDispatch) => {
	dispatch(sessionSlice.actions.removeLike(songId));
	dispatch(songsSlice.actions.removeLike(songId));
	await api.likes.toggleLike(songId, "DELETE");
};

export const fetchNewReleases = createAsyncThunk(
	"songs/fetchNewReleases",
	async (_, { dispatch }) => {
		const { songs } = await api.songs.getAll();

		// Fetch all artists in parallel and normalize them
		const uniqueArtistIds = [...new Set(songs.map((song) => song.artist_id))];
		const artists = await Promise.all(
			uniqueArtistIds.map((id) => api.artists.getOne(id)),
		);

		// Add users to store
		dispatch(
			userSlice.actions.addUsers(
				artists
					.filter(
						(artist): artist is NonNullable<typeof artist> => artist !== null,
					)
					.map((artist) => ({
						id: artist.id as UserId,
						display_name: artist.stage_name,
						profile_image: artist.profile_image,
						first_release: artist.first_release,
						biography: artist.biography,
						location: artist.location,
						homepage_url: artist.homepage,
					})),
			),
		);

		// Add songs to store
		dispatch(songsSlice.actions.addSongs(songs.map(apiSongToStore)));
	},
);

export const selectNewestSongs = createSelector(
	[(state: RootState) => state.song.songs],
	(songs): Song[] =>
		Object.values(songs).sort(
			(a, b) =>
				new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
		),
);

export const selectSongsByArtist = createSelector(
	[
		(state: RootState) => state.song.songs,
		(_: RootState, artistId: UserId) => artistId,
	],
	(songs, artistId): Song[] =>
		Object.values(songs)
			.filter((song) => song.artist_id === artistId)
			.sort(
				(a, b) =>
					new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
			),
);

export const createSongThunk = createAsyncThunk(
	"songs/createSong",
	async (songData: FormData) => {
		const response = await api.songs.create(songData);
		return response.id;
	},
);

export const fetchArtistSongs = createAsyncThunk(
	"songs/fetchArtistSongs",
	async (artistId: UserId, { dispatch }) => {
		const [{ songs }, artist] = await Promise.all([
			api.songs.getByArtist(artistId),
			api.artists.getOne(artistId),
		]);

		if (artist) {
			dispatch(
				userSlice.actions.addUser({
					id: artist.id as UserId,
					display_name: artist.stage_name,
					profile_image: artist.profile_image,
					first_release: artist.first_release,
					biography: artist.biography,
					location: artist.location,
					homepage_url: artist.homepage,
				}),
			);
		}

		dispatch(songsSlice.actions.addSongs(songs.map(apiSongToStore)));
	},
);

export const fetchSong = createAsyncThunk(
	"songs/fetchSong",
	async (songId: SongId, { dispatch }) => {
		const [song, comments] = await Promise.all([
			api.songs.getOne(songId),
			api.comments.getForSong(songId),
		]);

		const artist = await api.artists.getOne(song.artist_id);

		dispatch(songsSlice.actions.addSongs([apiSongToStore(song)]));
		dispatch(
			commentsSlice.actions.getComments(
				comments.comments.map((c) => apiCommentToStore(songId, c)),
			),
		);
		dispatch(userSlice.actions.addUser(apiUserToStore(artist)));
	},
);

// Additional selectors for common operations
export const selectSongById = (
	state: RootState,
	songId: SongId,
): Song | undefined => state.song.songs[songId];

export const selectSongComments = (
	state: RootState,
	songId: SongId,
): RSet<number> => state.song.comments[songId] ?? {};

export const songsSlice = createSlice({
	name: "songs",
	initialState,
	reducers: {
		addLike: (state, action: PayloadAction<SongId>) => {
			const song = state.songs[action.payload];

			if (song) {
				song.likes++;
			}
		},
		removeLike: (state, action: PayloadAction<SongId>) => {
			const song = state.songs[action.payload];

			if (song) {
				song.likes--;
			}
		},
		addSongs: (state, action: PayloadAction<Song[]>) => {
			for (const song of action.payload) {
				state.songs[song.id] = song;
			}
		},
		initializeComments: (state, action: PayloadAction<SongId>) => {
			if (!state.comments[action.payload]) {
				state.comments[action.payload] = {};
			}
		},
		addComment: (
			state,
			action: PayloadAction<{ songId: SongId; commentId: number }>,
		) => {
			const { songId, commentId } = action.payload;
			if (!state.comments[songId]) {
				state.comments[songId] = {};
			}
			state.comments[songId][commentId] = null;
		},
		removeComment: (
			state,
			action: PayloadAction<{ songId: SongId; commentId: number }>,
		) => {
			const { songId, commentId } = action.payload;
			if (state.comments[songId]) {
				delete state.comments[songId][commentId];
			}
		},
	},
});

export const { addSongs, initializeComments, addComment, removeComment } =
	songsSlice.actions;
export default songsSlice.reducer;

//songsslice is finished

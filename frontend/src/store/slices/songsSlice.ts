import {
	createAsyncThunk,
	createSelector,
	createSlice,
} from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { AppDispatch, RootState } from "..";
import { api } from "../api";
import type { ApiError, GetSong } from "../api";
import { apiCommentToStore, commentsSlice } from "./commentsSlice";
import { slice as sessionSlice } from "./sessionSlice";
import {
	type Song,
	type SongId,
	type SongSlice,
	type UserId,
	upgradeTimeStamps,
} from "./types";
import { apiUserToStore, slice as userSlice } from "./userSlice";

const initialState: SongSlice = {
	songs: {},
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
	async (
		songData: FormData,
		{ dispatch },
	): Promise<ApiError | SongId | undefined> => {
		try {
			const response = await api.songs.create(songData);
			const newSong = await api.songs.getOne(response.id);
			const artist = await api.artists.getOne(newSong.artist_id);
			artist.num_songs_by_artist++;
			dispatch(userSlice.actions.addUser(apiUserToStore(artist)));
			dispatch(songsSlice.actions.addSongs([newSong].map(apiSongToStore)));

			return response.id;
		} catch (e) {
			if (e instanceof Error) {
				return e.api;
			}
			throw e;
		}
	},
);

export const updateSongThunk = createAsyncThunk(
	"songs/updateSong",
	async (
		{ songId, songData }: { songId: SongId; songData: FormData },
		{ dispatch },
	): Promise<ApiError | undefined> => {
		try {
			api.songs.update(songId, songData).then(async () => {
				const updatedSong = await api.songs.getOne(songId);
				dispatch(
					songsSlice.actions.addSongs([updatedSong].map(apiSongToStore)),
				);
			});
		} catch (e) {
			if (e instanceof Error) {
				return e.api;
			}
			throw e;
		}
	},
);

export const deleteSongThunk = createAsyncThunk(
	"songs/deleteSong",
	async (
		songId: SongId,
		{ dispatch, getState },
	): Promise<undefined | ApiError> => {
		try {
			api.songs.delete(songId).then(async () => {
				const currentState = getState() as RootState;
				const currentUser = currentState.session.user!;
				const artistToUpdate = await api.artists.getOne(currentUser.id);
				artistToUpdate.num_songs_by_artist--;
				dispatch(userSlice.actions.addUser(apiUserToStore(artistToUpdate)));
				dispatch(songsSlice.actions.removeSong(songId));
			});
		} catch (e) {
			if (e instanceof Error) {
				return e.api;
			}
			throw e;
		}
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
				comments.comments.map((c) => apiCommentToStore(songId, c, c.user.id)),
			),
		);
		dispatch(userSlice.actions.addUser(apiUserToStore(artist)));

		dispatch(userSlice.actions.addUsers(comments.comments.map((c) => c.user)));
	},
);

// Additional selectors for common operations
export const selectSongById = (
	state: RootState,
	songId: SongId,
): Song | undefined => state.song.songs[songId];

export const selectSongComments = createSelector(
	[
		(state: RootState) => state.comment.comments,
		(_: RootState, songId: SongId) => songId,
	],
	(comments, songId) => {
		return Object.values(comments).filter((c) => c.song_id === songId);
	},
);

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
		removeSong: (state, action: PayloadAction<SongId>) => {
			delete state.songs[action.payload];
		},
	},
});

export const { addSongs } = songsSlice.actions;
export default songsSlice.reducer;

//songsslice is finished

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
	type StoreComment,
	type CommentsSlice,
	type SongId,
	upgradeTimeStamps,
} from "./types";
import { api, type UserComment } from "../api";

const initialState: CommentsSlice = {
	comments: {},
};

function apiCommentToStore(songId: SongId, comment: UserComment): StoreComment {
	const { user_id, ...rest } = comment;

	return upgradeTimeStamps({
		...rest,
		id: comment.id,
		song_id: songId,
		author_id: comment.user_id,
		text: comment.text,
	});
}

//fetch song comments thunk
export const fetchComments = createAsyncThunk(
	"comments/fetchComments",
	async (songId: SongId, { dispatch }) => {
		try {
			const { comments } = await api.comments.getForSong(songId);
			const storeComments = comments.map((comment) => {
				return apiCommentToStore(songId, comment);
			});
			dispatch(commentsSlice.actions.addComments(storeComments));
			return storeComments; // do we need to return this or just dispatch the necessary action to update store?
		} catch (e) {
			if (e instanceof Error) {
				return e.api;
			}
			throw e;
		}
	},
);

//comment slice
const commentsSlice = createSlice({
	name: "comments",
	initialState,
	reducers: {
		addComments: (state, action) => {
			action.payload.forEach((comment: StoreComment) => {
				state.comments[comment.id] = comment;
			});
		},
		clearComments: (state) => {
			state.comments = {};
		},
	},
});

export const { clearComments } = commentsSlice.actions;
export default commentsSlice.reducer;

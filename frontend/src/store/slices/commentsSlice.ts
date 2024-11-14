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
		song_id: songId,
		author_id: comment.user_id,
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
			dispatch(commentsSlice.actions.getComments(storeComments));
			return storeComments; // do we need to return this or just dispatch the necessary action to update store?
		} catch (e) {
			if (e instanceof Error) {
				return e.api;
			}
			throw e;
		}
	},
);

//post a new comment thunk
export const postCommentThunk = createAsyncThunk(
	"comments/postComment",
	async ({ songId, text }: { songId: SongId; text: string }, { dispatch }) => {
		try {
			const response = await api.comments.create(songId, { text });
			const currentUser = await api.auth.restore();

			const apiComment: UserComment = {
				id: response.id,
				text,
				user_id: currentUser.id,
				created_at: response.created_at,
				updated_at: response.updated_at,
			};
			const storeComment = apiCommentToStore(songId, apiComment);

			dispatch(commentsSlice.actions.addComment(storeComment));
			return apiComment; // do we need to return this?
		} catch (e) {
			if (e instanceof Error) {
				return e.api;
			}
			throw e;
		}
	},
);

// Async thunk to edit a comment
export const editCommentThunk = createAsyncThunk(
	"comments/editComment",
	async (
		{
			commentId,
			songId,
			text,
		}: { commentId: number; songId: SongId; text: string },
		{ dispatch },
	) => {
		try {
			const currentUser = await api.auth.restore();
			const response = await api.comments.update(commentId, { text });
			const updatedComment = {
				id: commentId,
				text,
				user_id: currentUser.id,
				created_at: response.created_at,
				updated_at: response.updated_at,
			};

			const { created_at, ...updatedStoreComment } = apiCommentToStore(
				songId,
				updatedComment,
			);

			dispatch(commentsSlice.actions.editComment(updatedStoreComment));
			return updatedStoreComment; // do we need to return it?
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
		getComments: (state, action) => {
			action.payload.forEach((comment: StoreComment) => {
				state.comments[comment.id] = comment;
			});
		},
		addComment: (state, action) => {
			const newComment = action.payload;
			state.comments[newComment.id] = newComment;
		},
		editComment: (state, action) => {
			const updatedComment = action.payload;
			state.comments[updatedComment.id] = updatedComment;
		},
		clearComments: (state) => {
			state.comments = {};
		},
	},
});

export const { clearComments } = commentsSlice.actions;
export default commentsSlice.reducer;

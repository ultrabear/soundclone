import {
	type PayloadAction,
	createAsyncThunk,
	createSlice,
} from "@reduxjs/toolkit";
import type { RootState } from "..";
import { type UserComment, api } from "../api";
import {
	type CommentId,
	type CommentsSlice,
	type SongId,
	type StoreComment,
	upgradeTimeStamps,
} from "./types";
import { apiUserToStore, slice as userSlice } from "./userSlice";

const initialState: CommentsSlice = {
	comments: {},
};

export function apiCommentToStore(
	songId: SongId,
	comment: UserComment,
): StoreComment {
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
		const { comments } = await api.comments.getForSong(songId);
		const users = await Promise.all(
			comments.map(async (comment) => {
				return api.artists.getOne(comment.user_id);
			}),
		);
		const arr = users.filter((v) => v !== null).map(apiUserToStore);
		dispatch(userSlice.actions.addUsers(arr));

		const storeComments = comments.map((comment) => {
			return apiCommentToStore(songId, comment);
		});
		dispatch(commentsSlice.actions.getComments(storeComments));
	},
);

//post a new comment thunk
export const postCommentThunk = createAsyncThunk(
	"comments/postComment",
	async (
		{ songId, text }: { songId: SongId; text: string },
		{ dispatch, getState },
	) => {
		const response = await api.comments.create(songId, { text });
		const currentState = getState() as RootState;
		const userId = currentState.session.user!.id;

		const apiComment: UserComment = {
			id: response.id,
			text,
			user_id: userId,
			created_at: response.created_at,
			updated_at: response.updated_at,
		};
		const storeComment = apiCommentToStore(songId, apiComment);

		dispatch(commentsSlice.actions.addComment(storeComment));
	},
);

// Async thunk to edit a comment
export const editCommentThunk = createAsyncThunk(
	"comments/editComment",
	async (
		{ commentId, text }: { commentId: number; songId: SongId; text: string },
		{ dispatch },
	) => {
		const response = await api.comments.update(commentId, { text });
		dispatch(
			commentsSlice.actions.editComment({
				id: commentId,
				text,
				updatedAt: response.updated_at,
			}),
		);
	},
);

//delete comment
export const deleteCommentThunk = createAsyncThunk(
	"comments/deleteComment",
	async (commentId: number, { dispatch }) => {
		await api.comments.delete(commentId);
		dispatch(commentsSlice.actions.deleteComment(commentId));
		return commentId;
	},
);

//comment slice
export const commentsSlice = createSlice({
	name: "comments",
	initialState,
	reducers: {
		getComments: (state, action: PayloadAction<StoreComment[]>) => {
			for (const c of action.payload) {
				state.comments[c.id] = c;
			}
		},
		addComment: (state, action: PayloadAction<StoreComment>) => {
			const newComment = action.payload;
			state.comments[newComment.id] = newComment;
		},
		editComment: (
			state,
			action: PayloadAction<{ id: CommentId; updatedAt: string; text: string }>,
		) => {
			const commentToUpdate = state.comments[action.payload.id];
			commentToUpdate.updated_at = action.payload.updatedAt;
			commentToUpdate.text = action.payload.text;
		},
		deleteComment: (state, action: PayloadAction<CommentId>) => {
			const deletedCommentId = action.payload;
			delete state.comments[deletedCommentId];
		},
		clearComments: (state) => {
			state.comments = {};
		},
	},
});

export const { clearComments } = commentsSlice.actions;
export default commentsSlice.reducer;

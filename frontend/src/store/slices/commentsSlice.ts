import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { CommentWithUser } from "../../types";
import { api } from "../api";
import type { RootState } from "../index";
import type { CommentsSlice } from "../slice_types";

const initialState: CommentsSlice = {
	comments: {},
	songs: {},
};

//fetch song comments thunk
export const fetchComments = createAsyncThunk(
	"comments/fetchComments",
	async (songId: number, { rejectWithValue }) => {
		try {
			const { comments } = await api.comments.getForSong(songId);
			const commentsWithUsers = await Promise.all(
				comments.map(async (comment) => {
					const user = await api.users.getOne(comment.user_id);

					const commentWithUser: CommentWithUser = {
						id: comment.id,
						song_id: songId,
						author_id: comment.user_id,
						comment_text: comment.text,
						created_at: comment.created_at,
						updated_at: comment.updated_at,
						user: {
							id: user.id,
							username: user.username,
							profile_image: user.profile_image ?? null,
						},
					};
					return commentWithUser;
				}),
			);
			return commentsWithUsers;
		} catch (err) {
			return rejectWithValue("Failed to fetch comments");
		}
	},
);

//post a new comment thunk
export const postComment = createAsyncThunk(
	"comments/postComment",
	async ({ songId, text }: CommentPayload, { getState, rejectWithValue }) => {
		try {
			const state = getState() as RootState;
			const { user } = state.session;
			if (!user) {
				return rejectWithValue("User not authenticated");
			}
			const response = await api.comments.create(songId, { text });

			const newComment: CommentWithUser = {
				id: response.id,
				song_id: songId,
				author_id: user.id,
				comment_text: text,
				created_at: response.created_at,
				updated_at: response.updated_at,
				user: {
					id: user.id,
					username: user.username,
					profile_image: user.profile_image ?? null,
				},
			};
			return newComment;
		} catch (err) {
			return rejectWithValue("Failed to post comment");
		}
	},
);

// Async thunk to edit a comment
export const editComment = createAsyncThunk(
	"comments/editComment",
	async (
		{ commentId, text }: { commentId: number; text: string },
		{ getState, rejectWithValue },
	) => {
		try {
			const state = getState() as RootState;
			const { user } = state.session;
			if (!user) {
				return rejectWithValue("User not authenticated");
			}
			const response = await api.comments.update(commentId, { text });
			return { commentId, comment_text: text, updated_at: response.updated_at };
		} catch (err) {
			return rejectWithValue("Failed to edit comment");
		}
	},
);

//delete comment
export const deleteComment = createAsyncThunk(
	"comments/deleteComment",
	async (commentId: number, { rejectWithValue }) => {
		try {
			await api.comments.delete(commentId);
			return commentId;
		} catch (err) {
			return rejectWithValue("Failed to delete comment");
		}
	},
);

//comment slice
const commentsSlice = createSlice({
	name: "comments",
	initialState,
	reducers: {
		clearComments: (state) => {
			state.comments = [];
			state.error = null;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchComments.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchComments.fulfilled, (state, action) => {
				state.loading = false;
				state.comments = action.payload;
			})
			.addCase(fetchComments.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			})
			.addCase(postComment.fulfilled, (state, action) => {
				state.comments.unshift(action.payload);
			})
			.addCase(postComment.rejected, (state, action) => {
				state.error = action.payload as string;
			})
			.addCase(editComment.fulfilled, (state, action) => {
				const { commentId, comment_text, updated_at } = action.payload;
				const comment = state.comments.find((c) => c.id === commentId);
				if (comment) {
					comment.comment_text = comment_text;
					comment.updated_at = updated_at;
				}
			})
			.addCase(editComment.rejected, (state, action) => {
				state.error = action.payload as string;
			})
			.addCase(deleteComment.fulfilled, (state, action) => {
				const commentId = action.payload;
				state.comments = state.comments.filter((c) => c.id !== commentId);
			})
			.addCase(deleteComment.rejected, (state, action) => {
				state.error = action.payload as string;
			});
	},
});

export const { clearComments } = commentsSlice.actions;
export default commentsSlice.reducer;

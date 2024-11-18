import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { AppDispatch } from "..";
import { type User as ApiUser, type FlaskError, api } from "../api";
import { playlistsSlice } from "./playlistsSlice";
import type { SessionSlice, SessionUser, SongId, User, UserId } from "./types";
import { usersSlice } from "./userSlice";
import { apiSongToStore, songsSlice } from "./songsSlice";

function authUserToStore(u: ApiUser): User {
	const { stage_name, username, ...rest } = u;

	return {
		...rest,
		display_name: stage_name || username,
	};
}

export const thunkAuthenticate = () => async (dispatch: AppDispatch) => {
	try {
		const [user, likes] = await Promise.all([
			api.auth.restore(),
			api.likes.getAll(),
		]);

		dispatch(slice.actions.setUser(user));
		dispatch(usersSlice.actions.addUser(authUserToStore(user)));
		dispatch(slice.actions.addBulkLikes(likes.songs.map((s) => s.id)));
		dispatch(songsSlice.actions.addSongs(likes.songs.map(apiSongToStore)));
		dispatch(
			usersSlice.actions.partialAddUsers(likes.songs.map((s) => s.artist)),
		);
	} catch (e) {
		dispatch(slice.actions.removeUser());
	}
};

export const thunkLogin =
	(credentials: { email: string; password: string }) =>
	async (dispatch: AppDispatch): Promise<FlaskError | undefined> => {
		try {
			const response = await api.auth.login(credentials);

			const [session, user] = normalizeApiUser(response);

			dispatch(slice.actions.setUser(session));
			dispatch(usersSlice.actions.addUser(user));
		} catch (e) {
			if (e instanceof Error) {
				return e.flaskError;
			}
			throw e;
		}
	};

export const thunkSignup =
	(cred: { username: string; email: string; password: string }) =>
	async (dispatch: AppDispatch): Promise<FlaskError | undefined> => {
		try {
			const response = (await api.auth.signup(cred))!;

			const [session, user] = normalizeApiUser(response);

			dispatch(slice.actions.setUser(session));
			dispatch(usersSlice.actions.addUser(user));
		} catch (e) {
			if (e instanceof Error) {
				return e.flaskError;
			}
			throw e;
		}
	};

export const thunkLogout = () => async (dispatch: AppDispatch) => {
	await api.auth.logout();
	dispatch(slice.actions.removeUser());
	dispatch(playlistsSlice.actions.clearPlaylists());
};

function normalizeApiUser(u: ApiUser): [SessionUser, User] {
	const {
		first_release,
		email,
		username,
		stage_name,
		profile_image,
		homepage,
		id,
		...rest
	} = u;

	const session: SessionUser = {
		username,
		email,
		id: id as UserId,
	};

	const user: User = {
		...rest,
		display_name: stage_name ?? session.username,
		id: session.id,
	};

	if (first_release !== undefined && first_release !== null) {
		user.first_release =
			typeof first_release === "string" ? first_release : undefined;
	}

	if (profile_image !== undefined && profile_image !== null) {
		user.profile_image =
			typeof profile_image === "string" ? profile_image : undefined;
	}

	if (homepage !== undefined && homepage !== null) {
		user.homepage_url = typeof homepage === "string" ? homepage : undefined;
	}

	return [session, user];
}

const initialState: SessionSlice = {
	user: null,
	likes: {},
};

export const slice = createSlice({
	name: "session",
	initialState,
	reducers: {
		setUser: (state, action: PayloadAction<SessionUser>) => {
			state.user = action.payload;
		},

		removeUser: (state) => {
			state.user = null;
			state.likes = {};
		},

		addBulkLikes: (state, action: PayloadAction<SongId[]>) => {
			for (const like of action.payload) {
				state.likes[like] = null;
			}
		},

		addLike: (state, action: PayloadAction<SongId>) => {
			state.likes[action.payload] = null;
		},

		removeLike: (state, action: PayloadAction<SongId>) => {
			delete state.likes[action.payload];
		},
	},
});

export default slice.reducer;

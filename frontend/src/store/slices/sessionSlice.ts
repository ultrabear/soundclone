import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { AppDispatch } from "..";
import { type User as ApiUser, api } from "../api";
import type { SessionSlice, SessionUser, SongId, User, UserId } from "./types";
import { usersSlice } from "./userSlice";
import { playlistsSlice } from "./playlistsSlice";

function authUserToStore(u: ApiUser): User {
	const { stage_name, username, ...rest } = u;

	return {
		...rest,
		display_name: stage_name || username,
	};
}

export const thunkAuthenticate = () => async (dispatch: AppDispatch) => {
	try {
		const res = await api.auth.restore();
		dispatch(slice.actions.setUser(res));
		dispatch(usersSlice.actions.addUser(authUserToStore(res)));
	} catch (e) {
		dispatch(slice.actions.removeUser());
	}
};

export const thunkLogin =
	(credentials: { email: string; password: string }) =>
	async (dispatch: AppDispatch) => {
		try {
			const response = await api.auth.login(credentials);

			const [session, user] = normalizeApiUser(response);

			dispatch(slice.actions.setUser(session));
			dispatch(usersSlice.actions.addUser(user));
		} catch (e) {
			if (e instanceof Error) {
				return e.api;
			}
			throw e;
		}
	};

export const thunkSignup =
	(cred: { username: string; email: string; password: string }) =>
	async (dispatch: AppDispatch) => {
		try {
			const response = (await api.auth.signup(cred))!;

			const [session, user] = normalizeApiUser(response);

			dispatch(slice.actions.setUser(session));
			dispatch(usersSlice.actions.addUser(user));
		} catch (e) {
			if (e instanceof Error) {
				return e.api;
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

	if (typeof first_release === "string") {
		user.first_release = first_release;
	}

	if (typeof profile_image === "string") {
		user.profile_image = profile_image;
	}

	if (typeof homepage === "string") {
		user.homepage_url = homepage;
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

import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { AppDispatch } from "..";
import { api, type User as ApiUser } from "../api";
import type { SessionSlice, SessionUser, UserId, User, SongId } from "./types";
import { slice as userSlice } from "./userSlice";

export const thunkAuthenticate = () => async (dispatch: AppDispatch) => {
	const response = await fetch("/api/auth");
	if (response.ok) {
		const data = await response.json();
		if (data.errors) {
			return;
		}

		dispatch(slice.actions.setUser(data));
	}
};

export const thunkLogin =
	(credentials: { email: string; password: string }) =>
	async (dispatch: AppDispatch) => {
		try {
			const response = (await api.auth.login(credentials))!;

			const [session, user] = normalizeApiUser(response);

			dispatch(slice.actions.setUser(session));
			dispatch(userSlice.actions.addUser(user));
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
			dispatch(userSlice.actions.addUser(user));
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
		user.first_release = new Date(first_release);
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

		addLike: (state, action: PayloadAction<SongId>) => {
			state.likes[action.payload] = null;
		},

		removeLike: (state, action: PayloadAction<SongId>) => {
			delete state.likes[action.payload];
		},
	},
});

export default slice.reducer;

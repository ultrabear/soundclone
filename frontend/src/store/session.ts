import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { AppDispatch } from ".";
import { api, type User as ApiUser } from "./api";
import type {
	SessionSlice,
	SessionUser,
	UserId,
	User,
	SongId,
} from "./slice_types";

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
		const response = await api.auth.login(credentials);
	};

export const thunkSignup =
	(user: { username: string; email: string; password: string }) =>
	async (dispatch: AppDispatch) => {
		const response = await fetch("/api/auth/signup", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(user),
		});

		if (response.ok) {
			const data = await response.json();
			dispatch(slice.actions.setUser(data));
		} else if (response.status < 500) {
			const errorMessages = await response.json();
			return errorMessages;
		} else {
			return { server: "Something went wrong. Please try again" };
		}
	};

export const thunkLogout = () => async (dispatch: AppDispatch) => {
	await fetch("/api/auth/logout");
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
		user.profile_image = new URL(profile_image);
	}

	if (typeof homepage === "string") {
		user.homepage_url = new URL(homepage);
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

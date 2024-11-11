import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { AppDispatch } from ".";
import type { User as ApiUser } from "./api";

export const thunkAuthenticate = () => async (dispatch: AppDispatch) => {
	const response = await fetch("/api/auth/");
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
		const response = await fetch("/api/auth/login", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(credentials),
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

function normalizeApiUser(u: ApiUser): User {
	const { first_release, ...rest } = u;

	if (first_release !== undefined) {
		return { ...rest, first_release: new Date(first_release) };
	}

	return rest;
}

type User = {
	id: number;
	username: string;
	email: string;
	profile_image?: string;
	stage_name?: string;
	first_release?: Date;
	biography?: string;
	location?: string;
	homepage?: string;
};

type SongId = number;
type SessionSlice = {
	user: User | null;
	likes: { [key: SongId]: undefined };
};

const initialState: SessionSlice = {
	user: null,
	likes: {},
};

export const slice = createSlice({
	name: "session",
	initialState,
	reducers: {
		setUser: (state, action: PayloadAction<ApiUser>) => {
			state.user = normalizeApiUser(action.payload);
		},

		removeUser: (state) => {
			state.user = null;
		},
	},
});

export default slice.reducer;

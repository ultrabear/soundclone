import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { Artist } from "../api";
import type { UserSlice, User, UserId } from "./types";
import { api } from "../api";
import type { AppDispatch } from "..";

const initialState: UserSlice = {
	users: {},
};

export function apiUserToStore(u: Artist): User {
	const { id, stage_name, first_release, ...rest } = u;

	const user: User = {
		id: id as UserId,
		display_name: stage_name,
		...rest,
	};

	if (first_release !== undefined) {
		user.first_release = new Date(first_release);
	}

	return user;
}

export const getUserDetails =
	(userId: number) => async (dispatch: AppDispatch) => {
		const user = await api.artists.getOne(userId);

		dispatch(slice.actions.addUser(apiUserToStore(user)));
	};

export const slice = createSlice({
	name: "users",
	initialState,
	reducers: {
		addUser: (store, action: PayloadAction<User>) => {
			store.users[action.payload.id] = action.payload;
		},

		addUsers: (store, action: PayloadAction<User[]>) => {
			for (const u of action.payload) {
				store.users[u.id] = u;
			}
		},
	},
});

export default slice.reducer;

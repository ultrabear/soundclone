import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { AppDispatch } from "..";
import type { RootState } from "..";
import type { Artist } from "../api";
import { api } from "../api";
import type { User, UserId, UserSlice } from "./types";

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
		user.first_release = first_release;
	}

	return user;
}

export const getUserDetails =
	(userId: number) => async (dispatch: AppDispatch) => {
		const user = await api.artists.getOne(userId);

		dispatch(usersSlice.actions.addUser(apiUserToStore(user)));
	};

export const createNewArtistThunk = createAsyncThunk(
	"users/createArtist",
	async (artist: FormData, { dispatch, getState }) => {
		try {
			const artistUser = await api.artists.update(artist);
			const currentState = getState() as RootState;
			const currentUser = currentState.session.user!;
			const { id, username } = currentUser!;
			const newArtist = {
				...artistUser,
				id,
				stage_name: artistUser.stage_name || username,
			};
			dispatch(usersSlice.actions.addUser(apiUserToStore(newArtist)));
		} catch (e) {
			if (e instanceof Error) {
				return e.api;
			}
			throw e;
		}
	},
);

export const usersSlice = createSlice({
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
		partialAddUsers: (
			store,
			action: PayloadAction<{ id: UserId; display_name: string }[]>,
		) => {
			for (const { id, display_name } of action.payload) {
				if (id in store.users) {
					store.users[id]!.display_name = display_name;
				} else {
					store.users[id] = { id, display_name };
				}
			}
		},
	},
});

export default usersSlice.reducer;

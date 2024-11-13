import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { UserSlice, User } from "./types";

const initialState: UserSlice = {
	users: {},
};

export const slice = createSlice({
	name: "users",
	initialState,
	reducers: {
		addUser: (store, action: PayloadAction<User>) => {
			store.users[action.payload.id] = action.payload;
		},
	},
});

export default slice.reducer;

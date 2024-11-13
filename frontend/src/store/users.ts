import { createSlice } from "@reduxjs/toolkit";
import { api } from "./api";
import type { UserSlice } from "./slice_types";

const initialState: UserSlice = {
	users: {},
};

export const slice = createSlice({
	name: "session",
	initialState,
	reducers: {},
});

export default slice.reducer;

import { createSlice } from "@reduxjs/toolkit";

type User = {
	id: number;
	username: string;
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
	reducers: {},
});

export default slice.reducer;

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { RootState } from "..";
import { api } from "../api";
import type { SearchResult } from "../api";

interface SearchState {
	results: SearchResult[];
	isLoading: boolean;
	error: string | null;
}

const initialState: SearchState = {
	results: [],
	isLoading: false,
	error: null,
};

export const searchContent = createAsyncThunk(
	"search/searchContent",
	async (query: string) => {
		if (!query || query.length < 2) return { results: [] };
		return await api.search.query(query);
	},
);

const searchSlice = createSlice({
	name: "search",
	initialState,
	reducers: {
		clearResults: (state) => {
			state.results = [];
			state.error = null;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(searchContent.pending, (state) => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(searchContent.fulfilled, (state, action) => {
				state.isLoading = false;
				state.results = action.payload.results;
			})
			.addCase(searchContent.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.error.message || "Search failed";
			});
	},
});

export const { clearResults } = searchSlice.actions;
export const selectSearchResults = (state: RootState) => state.search.results;
export const selectSearchLoading = (state: RootState) => state.search.isLoading;
export const selectSearchError = (state: RootState) => state.search.error;

export default searchSlice.reducer;

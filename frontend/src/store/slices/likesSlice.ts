// likesSlice.ts

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../api";
import type { SongWithUser } from "../../types";
import type { GetSong } from "../api";

interface LikesState {
  likedSongs: SongWithUser[];
  loading: boolean;
  error: string | null;
}

const initialState: LikesState = {
  likedSongs: [],
  loading: false,
  error: null,
};

const transformSongData = (song: GetSong, user: any): SongWithUser => ({
  id: song.id,
  name: song.name,
  artist_id:
    typeof song.artist_id === "string"
      ? Number.parseInt(song.artist_id, 10)
      : song.artist_id,
  genre: song.genre ?? null,
  thumb_url: song.thumb_url ?? null,
  song_ref: song.song_ref,
  created_at: song.created_at,
  updated_at: song.updated_at,
  user: {
    id: user.id,
    username: user.username,
    stage_name: user.stage_name ?? null,
    profile_image: user.profile_image ?? null,
  },
});

// fetch liked songs thunk
export const fetchLikedSongs = createAsyncThunk(
  "likes/fetchLikedSongs",
  async (_, { rejectWithValue }) => {
    try {
      const { songs } = await api.likes.getAll();
      const songsWithUsers = await Promise.all(
        songs.map(async (song) => {
          const artistId =
            typeof song.artist_id === "string"
              ? Number.parseInt(song.artist_id, 10)
              : song.artist_id;
          const user = await api.users.getOne(artistId);
          return transformSongData(song, user);
        })
      );
      return songsWithUsers;
    } catch (err) {
      return rejectWithValue("Failed to fetch liked songs");
    }
  }
);

// like a song
export const likeSong = createAsyncThunk(
  "likes/likeSong",
  async (songId: number, { rejectWithValue }) => {
    try {
      await api.likes.toggleLike(songId, "POST");
      return songId;
    } catch (err) {
      return rejectWithValue("Failed to like song");
    }
  }
);

//  unlike a song
export const unlikeSong = createAsyncThunk(
  "likes/unlikeSong",
  async (songId: number, { rejectWithValue }) => {
    try {
      await api.likes.toggleLike(songId, "DELETE");
      return songId;
    } catch (err) {
      return rejectWithValue("Failed to unlike song");
    }
  }
);


const likesSlice = createSlice({
  name: "likes",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLikedSongs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLikedSongs.fulfilled, (state, action) => {
        state.loading = false;
        state.likedSongs = action.payload;
      })
      .addCase(fetchLikedSongs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(unlikeSong.fulfilled, (state, action) => {

        state.likedSongs = state.likedSongs.filter(
          (song) => song.id !== action.payload
        );
      });
  },
});

export default likesSlice.reducer;

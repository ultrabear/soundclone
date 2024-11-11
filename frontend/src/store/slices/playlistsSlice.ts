// src/store/slices/playlistsSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PlaylistWithUser } from "../../types";

export const mockPlaylistData = {
  id: 1,
  name: "Featured Playlist",
  user_id: 1,
  user: {
    id: 1,
    username: "featured_curator",
    stage_name: "Featured Curator",
    profile_image: null 
  },
  thumbnail: "https://upload.wikimedia.org/wikipedia/commons/0/0e/Continuum_by_John_Mayer_%282006%29.jpg",
  songs: [
    {
      id: 1,
      name: "Amazing Song",
      artist_id: 1,
      genre: "Pop",
      thumb_url: "https://example.com/thumb1.jpg",
      song_ref: "song1.mp3",
      user: {
        id: 1,
        username: "artist1",
        stage_name: "Cool Artist",
        profile_image: null
      },
      created_at: "2024-03-01",
      updated_at: "2024-03-01",
    },
  ],
  created_at: "2024-03-01",
  updated_at: "2024-03-01",
};

interface PlaylistsState {
    playlists: Record<number, PlaylistWithUser>;  
    currentPlaylist: PlaylistWithUser | null;    
    userPlaylists: PlaylistWithUser[];           
    loading: boolean;
    error: string | null;
  }

const initialState: PlaylistsState = {
  playlists: {},
  currentPlaylist: null,
  userPlaylists: [],
  loading: false,
  error: null,
};

export const fetchUserPlaylists = createAsyncThunk(
    "playlists/fetchUserPlaylists",
    async () => {
      // Mock implementation for now
      await new Promise(resolve => setTimeout(resolve, 500));
      return { playlists: [mockPlaylistData] };
    }
  );

export const fetchPlaylist = createAsyncThunk(
  "playlists/fetchPlaylist",
  async (_id: number) => {
    // For now return mock data
    await new Promise(resolve => setTimeout(resolve, 500));
    return { playlist: mockPlaylistData };
  }
);

export const addSongToPlaylist = createAsyncThunk(
  "playlists/addSong",
  async ({ playlistId, songId }: { playlistId: number; songId: number }) => {
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 500));
    return { playlistId, songId };
  }
);

const playlistsSlice = createSlice({
  name: "playlists",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlaylist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlaylist.fulfilled, (state, action) => {
        state.loading = false;
        const playlist = action.payload.playlist;
        state.playlists[playlist.id] = playlist;
        state.currentPlaylist = playlist;
      })
      .addCase(fetchPlaylist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to fetch playlist";
      })
      .addCase(fetchUserPlaylists.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserPlaylists.fulfilled, (state, action) => {
        state.loading = false;
        state.userPlaylists = action.payload.playlists;
      })
      .addCase(fetchUserPlaylists.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to fetch user playlists";
      })
      .addCase(addSongToPlaylist.fulfilled, (_state, _action) => {
        // Implementation for adding song to playlist
      });
  },
});



export default playlistsSlice.reducer;
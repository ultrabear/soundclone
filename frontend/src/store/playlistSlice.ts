import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PlaylistWithUser, SongWithUser } from '../types';

interface PlaylistState {
    currentPlaylist: PlaylistWithUser | null;
    loading: boolean;
    error: string | null;
}

const initialState: PlaylistState = {
    currentPlaylist: null,
    loading: false,
    error: null,
};

// Mock data for development
export const mockPlaylistData = {
    id: 1,
    name: "More of what you like",
    user_id: 1,
    thumbnail: "https://upload.wikimedia.org/wikipedia/commons/0/0e/Continuum_by_John_Mayer_%282006%29.jpg",
    created_at: "2024-03-01",
    updated_at: "2024-03-01",
    user: {
        id: 1,
        username: "coolUser",
        stage_name: "Cool Artist",
        profile_image: "https://example.com/profile.jpg"
    },
    songs: [
        {
            id: 1,
            name: "Amazing Song",
            artist_id: 1,
            genre: "Pop",
            thumb_url: "https://upload.wikimedia.org/wikipedia/commons/0/0e/Continuum_by_John_Mayer_%282006%29.jpg",
            song_ref: "song1.mp3",
            created_at: "2024-03-01",
            updated_at: "2024-03-01",
            user: {
                id: 1,
                username: "artist1",
                stage_name: "Cool Artist",
                profile_image: "https://example.com/profile.jpg"
            }
        },
        {
            id: 2,
            name: "Cool Track",
            artist_id: 2,
            genre: "Rock",
            thumb_url: "https://example.com/song2.jpg",
            song_ref: "song2.mp3",
            created_at: "2024-03-02",
            updated_at: "2024-03-02",
            user: {
                id: 2,
                username: "artist2",
                stage_name: "Awesome Artist",
                profile_image: "https://example.com/artist2.jpg"
            }
        }
    ]
};

export const fetchPlaylist = createAsyncThunk(
    'playlist/fetchPlaylist',
    async (playlistId: number) => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { data: mockPlaylistData };
    }
);

export const addSongToPlaylist = createAsyncThunk(
    'playlist/addSong',
    async ({ playlistId, songId }: { playlistId: number; songId: number }) => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log(`Adding song ${songId} to playlist ${playlistId}`);
        return { success: true };
    }
);

const playlistSlice = createSlice({
    name: 'playlist',
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
                state.currentPlaylist = action.payload.data;
            })
            .addCase(fetchPlaylist.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message ?? 'Failed to fetch playlist';
            })
            .addCase(addSongToPlaylist.fulfilled, (state, action) => {
                // need to add logic to update playlist state
                console.log('Song added to playlist successfully');
            });
    },
});

export default playlistSlice.reducer;
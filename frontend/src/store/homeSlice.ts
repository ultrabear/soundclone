import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { User, Song, Playlist } from '../types';

interface HomeState {
    featuredArtists: User[];
    newReleases: Song[];
    userPlaylists: Playlist[];
    likedSongs: Song[];
    loading: {
        artists: boolean;
        releases: boolean;
        playlists: boolean;
    };
    error: {
        artists: string | null;
        releases: string | null;
        playlists: string | null;
    };
}

const initialState: HomeState = {
    featuredArtists: [],
    newReleases: [],
    userPlaylists: [],
    likedSongs: [],
    loading: {
        artists: false,
        releases: false,
        playlists: false,
    },
    error: {
        artists: null,
        releases: null,
        playlists: null,
    },
};

export const fetchFeaturedArtists = createAsyncThunk(
    'home/fetchFeaturedArtists',
    async () => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return {
            //MARK: need to update once using seeder data
            data: [
                {
                    id: 1,
                    username: "artist1",
                    profile_image: null,
                    stage_name: "Cool Artist",
                    first_release: "2023-01-01",
                    biography: "Bio here",
                    location: "NYC",
                    homepage: null
                },
                {
                    id: 2,
                    username: "artist2",
                    profile_image: null,
                    stage_name: "Awesome Artist",
                    first_release: "2022-01-01",
                    biography: "Bio here",
                    location: "LA",
                    homepage: null
                },
                {
                    id: 3,
                    username: "artist3",
                    profile_image: null,
                    stage_name: "Super Artist",
                    first_release: "2022-06-01",
                    biography: "Bio here",
                    location: "Chicago",
                    homepage: null
                },
                {
                    id: 4,
                    username: "artist4",
                    profile_image: null,
                    stage_name: "Amazing Artist",
                    first_release: "2023-03-01",
                    biography: "Bio here",
                    location: "Miami",
                    homepage: null
                }
            ]
        };
    }
);

export const fetchNewReleases = createAsyncThunk(
    'home/fetchNewReleases',
    async () => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return {
            //MARK: need to update once using seeder data
            data: [
                {
                    id: 1,
                    name: "Amazing Song",
                    artist_id: 1,
                    genre: "Pop",
                    thumb_url: null,
                    song_ref: "song1.mp3",
                    created_at: "2024-03-01",
                    updated_at: "2024-03-01"
                },
                {
                    id: 2,
                    name: "Cool Track",
                    artist_id: 2,
                    genre: "Rock",
                    thumb_url: null,
                    song_ref: "song2.mp3",
                    created_at: "2024-03-02",
                    updated_at: "2024-03-02"
                },
                {
                    id: 3,
                    name: "Epic Tune",
                    artist_id: 3,
                    genre: "Electronic",
                    thumb_url: null,
                    song_ref: "song3.mp3",
                    created_at: "2024-03-03",
                    updated_at: "2024-03-03"
                },
                {
                    id: 4,
                    name: "Chill Vibes",
                    artist_id: 4,
                    genre: "Lo-fi",
                    thumb_url: null,
                    song_ref: "song4.mp3",
                    created_at: "2024-03-04",
                    updated_at: "2024-03-04"
                }
            ]
        };
    }
);

export const fetchUserPlaylists = createAsyncThunk(
    'home/fetchUserPlaylists',
    async () => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return {
            //MARK: need to update once using seeder data
            playlists: [
                {
                    id: 1,
                    name: "My Favorites",
                    user_id: 1,
                    thumbnail: null,
                    created_at: "2024-03-01",
                    updated_at: "2024-03-01"
                },
                {
                    id: 2,
                    name: "Workout Mix",
                    user_id: 1,
                    thumbnail: null,
                    created_at: "2024-03-02",
                    updated_at: "2024-03-02"
                },
                {
                    id: 3,
                    name: "Chill Playlist",
                    user_id: 1,
                    thumbnail: null,
                    created_at: "2024-03-03",
                    updated_at: "2024-03-03"
                }
            ]
        };
    }
);

const homeSlice = createSlice({
    name: 'home',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Featured Artists
            .addCase(fetchFeaturedArtists.pending, (state) => {
                state.loading.artists = true;
                state.error.artists = null;
            })
            .addCase(fetchFeaturedArtists.fulfilled, (state, action) => {
                state.loading.artists = false;
                state.featuredArtists = action.payload.data;
            })
            .addCase(fetchFeaturedArtists.rejected, (state, action) => {
                state.loading.artists = false;
                state.error.artists = action.error.message ?? 'Failed to fetch artists';
            })
            // New Releases
            .addCase(fetchNewReleases.pending, (state) => {
                state.loading.releases = true;
                state.error.releases = null;
            })
            .addCase(fetchNewReleases.fulfilled, (state, action) => {
                state.loading.releases = false;
                state.newReleases = action.payload.data;
            })
            .addCase(fetchNewReleases.rejected, (state, action) => {
                state.loading.releases = false;
                state.error.releases = action.error.message ?? 'Failed to fetch releases';
            })
            // User Playlists
            .addCase(fetchUserPlaylists.pending, (state) => {
                state.loading.playlists = true;
                state.error.playlists = null;
            })
            .addCase(fetchUserPlaylists.fulfilled, (state, action) => {
                state.loading.playlists = false;
                state.userPlaylists = action.payload.playlists;
            })
            .addCase(fetchUserPlaylists.rejected, (state, action) => {
                state.loading.playlists = false;
                state.error.playlists = action.error.message ?? 'Failed to fetch playlists';
            });
    },
});

export default homeSlice.reducer;
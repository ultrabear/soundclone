import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { User, Song, SongWithUser, Playlist } from "../types";

interface HomeState {
  featuredArtists: User[];
  newReleases: SongWithUser[];
  userPlaylists: Playlist[];
  likedSongs: SongWithUser[];
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

const mockArtists: User[] = [
  {
    id: 1,
    username: "artist1",
    profile_image:
      "https://media.them.us/photos/663bc34e344e5d57d900f2ee/16:9/w_2560%2Cc_limit/lady-gaga.jpg",
    stage_name: "Cool Artist",
    first_release: "2023-01-01",
    biography: "Bio here",
    location: "NYC",
    homepage: null,
  },
  {
    id: 2,
    username: "artist2",
    profile_image:
      "https://ucarecdn.com/b08dd9d1-6b2a-4e24-8182-2670f83cbacf/-/crop/1916x1300/2,0/-/resize/840x570/",
    stage_name: "Awesome Artist",
    first_release: "2022-01-01",
    biography: "Bio here",
    location: "LA",
    homepage: null,
  },
  {
    id: 3,
    username: "artist3",
    profile_image:
      "https://pyxis.nymag.com/v1/imgs/dbb/f89/8fedfcc682a11b2f985272ec455cf4aec4-blackpink.1x.rsquare.w1400.jpg",
    stage_name: "Super Artist",
    first_release: "2022-06-01",
    biography: "Bio here",
    location: "Chicago",
    homepage: null,
  },
  {
    id: 4,
    username: "artist4",
    profile_image:
      "https://i.guim.co.uk/img/media/67944850a1b5ebd6a0fba9e3528d448ebe360c60/359_0_2469_1482/master/2469.jpg?width=1200&height=900&quality=85&auto=format&fit=crop&s=1157be337c6e200937b038797d772f5f",
    stage_name: "Amazing Artist",
    first_release: "2023-03-01",
    biography: "Bio here",
    location: "Miami",
    homepage: null,
  },
  {
    id: 5,
    username: "artist5",
    profile_image:
      "https://hips.hearstapps.com/hmg-prod/images/gettyimages-1149694614-copy.jpg",
    stage_name: "Epic Artist",
    first_release: "2022-05-01",
    biography: "Bio here",
    location: "Berlin",
    homepage: null,
  },
  {
    id: 6,
    username: "artist6",
    profile_image:
      "https://www.vice.com/wp-content/uploads/sites/2/2018/02/1518195506890-abba.jpeg",
    stage_name: "Stellar Artist",
    first_release: "2023-02-01",
    biography: "Bio here",
    location: "Tokyo",
    homepage: null,
  },
  {
    id: 7,
    username: "artist7",
    profile_image:
      "https://cdns-images.dzcdn.net/images/artist/37591b67239c574e773570ab5dd4287b/1900x1900-000000-80-0-0.jpg",
    stage_name: "Cosmic Artist",
    first_release: "2023-06-01",
    biography: "Bio here",
    location: "Paris",
    homepage: null,
  },
];

const mockSongs: Song[] = [
  {
    id: 1,
    name: "Amazing Song",
    artist_id: 1,
    genre: "Pop",
    thumb_url:
      "https://upload.wikimedia.org/wikipedia/commons/0/0e/Continuum_by_John_Mayer_%282006%29.jpg",
    song_ref: "song1.mp3",
    created_at: "2024-03-01",
    updated_at: "2024-03-01",
  },
  {
    id: 2,
    name: "Cool Track",
    artist_id: 2,
    genre: "Rock",
    thumb_url:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSAuEMNtE9NIc7M1Ldr1REFZZaRLkOSV6IPhQ&s",
    song_ref: "song2.mp3",
    created_at: "2024-03-02",
    updated_at: "2024-03-02",
  },
  {
    id: 3,
    name: "Epic Tune",
    artist_id: 3,
    genre: "Electronic",
    thumb_url:
      "https://archive.smashing.media/assets/344dbf88-fdf9-42bb-adb4-46f01eedd629/aecf4604-1d3b-417f-97c6-d5be80f51eb9/3.jpg",
    song_ref: "song3.mp3",
    created_at: "2024-03-03",
    updated_at: "2024-03-03",
  },
  {
    id: 4,
    name: "Chill Vibes",
    artist_id: 4,
    genre: "Lo-fi",
    thumb_url:
      "https://miro.medium.com/v2/resize:fit:681/1*EBOL4lka5QjcYoxj6AHp-g.png",
    song_ref: "song4.mp3",
    created_at: "2024-03-04",
    updated_at: "2024-03-04",
  },
  {
    id: 5,
    name: "Summer Vibes",
    artist_id: 5,
    genre: "House",
    thumb_url:
      "https://www.billboard.com/wp-content/uploads/2022/03/48.-Lady-Gaga-%E2%80%98The-Fame-Monster-2009-album-art-billboard-1240.jpg?w=600",
    song_ref: "song5.mp3",
    created_at: "2024-03-05",
    updated_at: "2024-03-05",
  },
  {
    id: 6,
    name: "Night Drive",
    artist_id: 6,
    genre: "Synthwave",
    thumb_url:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQLQ0YmwOcndgYU7tcSL7PggPb8ZfXPch8uaA&s",
    song_ref: "song6.mp3",
    created_at: "2024-03-06",
    updated_at: "2024-03-06",
  },
  {
    id: 7,
    name: "Morning Coffee",
    artist_id: 7,
    genre: "Jazz",
    thumb_url:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSAuEMNtE9NIc7M1Ldr1REFZZaRLkOSV6IPhQ&s",
    song_ref: "song7.mp3",
    created_at: "2024-03-07",
    updated_at: "2024-03-07",
  },
];

const mockPlaylists: Playlist[] = [
  {
    id: 1,
    name: "My Favorites",
    user_id: 1,
    thumbnail:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSAuEMNtE9NIc7M1Ldr1REFZZaRLkOSV6IPhQ&s",
    created_at: "2024-03-01",
    updated_at: "2024-03-01",
  },
  //continue mock data for playlists
];

export const fetchFeaturedArtists = createAsyncThunk(
  "home/fetchFeaturedArtists",
  async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return { data: mockArtists };
  }
);

export const fetchNewReleases = createAsyncThunk(
  "home/fetchNewReleases",
  async (_, { getState }) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const state = getState() as { home: HomeState };

    const songsWithUsers: SongWithUser[] = mockSongs.map((song) => ({
      ...song,
      user: state.home.featuredArtists.find(
        (artist) => artist.id === song.artist_id
      )
        ? {
            id: song.artist_id,
            username: state.home.featuredArtists.find(
              (artist) => artist.id === song.artist_id
            )!.username,
            stage_name: state.home.featuredArtists.find(
              (artist) => artist.id === song.artist_id
            )!.stage_name,
            profile_image: state.home.featuredArtists.find(
              (artist) => artist.id === song.artist_id
            )!.profile_image,
          }
        : {
            id: song.artist_id,
            username: "Unknown Artist",
            stage_name: null,
            profile_image: null,
          },
    }));

    return { data: songsWithUsers };
  }
);

export const fetchUserPlaylists = createAsyncThunk(
  "home/fetchUserPlaylists",
  async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return { playlists: mockPlaylists };
  }
);

const homeSlice = createSlice({
  name: "home",
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
        state.error.artists = action.error.message ?? "Failed to fetch artists";
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
        state.error.releases =
          action.error.message ?? "Failed to fetch releases";
      })
      // User Playlists
      .addCase(fetchUserPlaylists.pending, (state) => {
        state.loading.playlists = true;
        state.error.playlists = null;
      })
      .addCase(fetchUserPlaylists.fulfilled, (state, action) => {
        state.loading.playlists = false;
        if (action.payload.playlists) {
          state.userPlaylists = action.payload.playlists;
        }
      })
      .addCase(fetchUserPlaylists.rejected, (state, action) => {
        state.loading.playlists = false;
        state.error.playlists =
          action.error.message ?? "Failed to fetch playlists";
      });
  },
});

export default homeSlice.reducer;

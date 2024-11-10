import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { User } from "../../types";

// Mock data
export const mockArtists: User[] = [
  {
    id: 1,
    username: "artist1",
    profile_image: "https://media.them.us/photos/663bc34e344e5d57d900f2ee/16:9/w_2560%2Cc_limit/lady-gaga.jpg",
    stage_name: "Cool Artist",
    first_release: "2023-01-01",
    biography: "Bio here",
    location: "NYC",
    homepage: null,
  },
  {
    id: 2,
    username: "artist2",
    profile_image: "https://ucarecdn.com/b08dd9d1-6b2a-4e24-8182-2670f83cbacf/-/crop/1916x1300/2,0/-/resize/840x570/",
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


interface ArtistsState {
  featuredArtists: User[];
  loading: boolean;
  error: string | null;
}

const initialState: ArtistsState = {
  featuredArtists: [],
  loading: false,
  error: null,
};

export const fetchFeaturedArtists = createAsyncThunk(
  "artists/fetchFeatured",
  async () => {
    // Using mock data instead of API call for now
    await new Promise(resolve => setTimeout(resolve, 500));
    return { data: mockArtists };
  }
);

const artistsSlice = createSlice({
  name: "artists",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeaturedArtists.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeaturedArtists.fulfilled, (state, action) => {
        state.loading = false;
        state.featuredArtists = action.payload.data;
      })
      .addCase(fetchFeaturedArtists.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to fetch artists";
      });
  },
});

export default artistsSlice.reducer;
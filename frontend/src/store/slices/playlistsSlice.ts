import {
	type PayloadAction,
	createAsyncThunk,
	createSlice,
	createAction 
  } from "@reduxjs/toolkit";
  import type { RootState } from "..";
  import type { BasePlaylist, Id, Timestamps } from "../api";
  import { api } from "../api";
  import type { Playlist, PlaylistId, PlaylistSlice, SongId, UserId } from "./types";
  import { upgradeTimeStamps } from "./types";
  import { apiSongToStore, songsSlice } from "./songsSlice";
  
  const initialState: PlaylistSlice = {
	playlists: {},
	likedSongsPlaylist: null,
  };

  export const clearPlaylists = createAction("playlists/clearPlaylists");

  function apiPlaylistToStore(
	p: BasePlaylist & Id & Timestamps & { user_id?: UserId },
	user_id: UserId,
	songs: SongId[],
  ): Playlist {
	return upgradeTimeStamps({
	  ...p,
	  user_id: p.user_id || user_id,
	  songs: Object.fromEntries(songs.map((s) => [s, null])),
	});
  }

  export const createLikedSongsPlaylist = createAsyncThunk(
	"playlists/createLikedSongsPlaylist",
	async (_, { dispatch, getState }) => {
	  const state = getState() as RootState;
	  if (!state.session.user) return null;
	  
	  const sessionUser = state.session.user.id;
	  
	  const existingLikedSongsPlaylist = Object.values(state.playlist.playlists)
		.find(playlist => 
		  playlist.name === "Liked Songs" && 
		  playlist.user_id === sessionUser
		);
	  
	  if (existingLikedSongsPlaylist) {
		dispatch(playlistsSlice.actions.setLikedSongsPlaylist(existingLikedSongsPlaylist.id));
		return existingLikedSongsPlaylist;
	  }
  
	  const playlistData = {
		name: "Liked Songs",
		thumbnail: "/assets/images/liked-songs-default.png",
	  };
  
	  try {
		const response = await api.playlists.create(playlistData);
		const likedSongs = await api.likes.getAll();
  
		await Promise.all(
		  likedSongs.songs.map((song) => 
			api.playlists.addSong(response.id, song.id)
		  )
		);
  
		const fullPlaylistData = apiPlaylistToStore(
		  {
			...response,
			...playlistData,
			user_id: sessionUser
		  },
		  sessionUser,
		  likedSongs.songs.map(s => s.id)
		);
		
		dispatch(playlistsSlice.actions.addPlaylist(fullPlaylistData));
		dispatch(playlistsSlice.actions.setLikedSongsPlaylist(response.id));
		dispatch(songsSlice.actions.addSongs(likedSongs.songs.map(apiSongToStore)));
		
		return fullPlaylistData;
	  } catch (error) {
		console.error("Error creating Liked Songs playlist:", error);
		return null;
	  }
	}
  );
  
  export const updateLikedSongsPlaylist = createAsyncThunk(
	"playlists/updateLikedSongsPlaylist",
	async (songId: number, { getState, dispatch }) => {
	  const state = getState() as RootState;
	  let likedPlaylistId = state.playlist.likedSongsPlaylist;
	  
	  if (!likedPlaylistId) {
		const result = await dispatch(createLikedSongsPlaylist()).unwrap();
		if (!result) return; 
		likedPlaylistId = result.id;
	  }
  
	  const isLiked = songId in (state.session.likes ?? {});
	  
	  try {
		if (!isLiked) {
		  await api.playlists.addSong(likedPlaylistId, songId);
		  dispatch(playlistsSlice.actions.addSongToPlaylist({
			playlist: likedPlaylistId,
			song: songId
		  }));
		} else {
		  await api.playlists.removeSong(likedPlaylistId, songId);
		  dispatch(playlistsSlice.actions.removeSongFromPlaylist({
			playlist: likedPlaylistId,
			song: songId
		  }));
		}
	  } catch (error) {
		console.error("Error updating liked songs playlist:", error);
	  }
	}
  );

  export const fetchUserPlaylists = createAsyncThunk(
	"playlists/fetchUserPlaylists",
	async (_: undefined, { dispatch, getState }) => {
	  const state = getState() as RootState;
	  const sessionUser = state.session.user!.id;
  
	  const playlist = await api.playlists.getCurrent();
	  
	  const userPlaylists = playlist.playlists 
  
	  const songs = await Promise.all(
		userPlaylists.map((p) =>
		  (async () => ({
			p: { ...p, user_id: sessionUser },
			s: await api.playlists.getSongs(p.id)
		  }))(),
		),
	  );
  
	  dispatch(
		playlistsSlice.actions.addPlaylists(
		  songs.map((p) =>
			apiPlaylistToStore(
			  p.p,
			  sessionUser,
			  p.s.songs.map((s) => s.id),
			),
		  ),
		),
	  );
	},
  );

export const fetchPlaylist = createAsyncThunk(
	"playlists/fetchPlaylist",
	async (id: number, { dispatch, getState }) => {
		const state = getState() as RootState;
		const sessionUser = state.session.user!.id;

		const [playlist, songs] = await Promise.all([
			api.playlists.getOne(id),
			api.playlists.getSongs(id),
		]);

		dispatch(
			playlistsSlice.actions.addPlaylist(
				apiPlaylistToStore(
					playlist,
					sessionUser,
					songs.songs.map((s) => s.id),
				),
			),
		);
		dispatch(songsSlice.actions.addSongs(songs.songs.map(apiSongToStore)));
	},
);

export const addSongToPlaylistThunk = createAsyncThunk(
	"playlists/addSong",
	async (
	  { playlist, song }: { playlist: PlaylistId; song: SongId },
	  { dispatch },
	) => {
	  await api.playlists.addSong(playlist, song);
	  dispatch(
		playlistsSlice.actions.addSongToPlaylist({
		  playlist,
		  song,
		}),
	  );
	},
  );

  const playlistsSlice = createSlice({
	name: "playlists",
	initialState,
	reducers: {
	  addPlaylists: (state, action: PayloadAction<Playlist[]>) => {
		for (const p of action.payload) {
		  state.playlists[p.id] = p;
		}
	  },
  
	  addPlaylist: (state, action: PayloadAction<Playlist>) => {
		state.playlists[action.payload.id] = action.payload;
	  },
  
	  addSongToPlaylist: (
		state,
		action: PayloadAction<{ playlist: PlaylistId; song: SongId }>,
	  ) => {
		const { playlist, song } = action.payload;
		const list = state.playlists[playlist]?.songs;
		if (list != null && song in list) {
		  list[song] = null;
		}
	  },
  
	  removeSongFromPlaylist: (
		state,
		action: PayloadAction<{ playlist: PlaylistId; song: SongId }>,
	  ) => {
		const { playlist, song } = action.payload;
		const list = state.playlists[playlist]?.songs;
		if (list !== null) {
		  delete list?.[song];
		}
	  },
  
	  setLikedSongsPlaylist: (state, action: PayloadAction<PlaylistId>) => {
		state.likedSongsPlaylist = action.payload;
	  },
	},

	extraReducers: (builder) => {
	  builder.addCase(clearPlaylists, (state) => {
		state.playlists = {};
		state.likedSongsPlaylist = null;
	  });
	},
  });



  export const {
	addPlaylists,
	addPlaylist,
	addSongToPlaylist,
	removeSongFromPlaylist,
	setLikedSongsPlaylist,
  } = playlistsSlice.actions;
  

export default playlistsSlice.reducer;

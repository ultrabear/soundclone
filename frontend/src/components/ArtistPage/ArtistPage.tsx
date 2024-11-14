import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store";
import { setCurrentSong } from "../../store/playerSlice";
import { fetchArtistSongs } from "../../store/slices/songsSlice";
import type { Song, PlaylistId } from "../../store/slices/types";
import type { SongWithUser } from "../../types"; 
import { slice as userSlice } from "../../store/slices/userSlice";
import { api } from "../../store/api";
import Layout from "../Layout/Layout";
import "./ArtistPage.css";

// Temporary transform functions until all slices are updated
const apiUserToStoreUser = (apiUser: any) => ({
	id: apiUser.id,
	display_name: apiUser.stage_name || apiUser.username,
	profile_image: apiUser.profile_image ?? null, 
	first_release: apiUser.first_release ? new Date(apiUser.first_release) : undefined,
	biography: apiUser.biography ?? null, 
	location: apiUser.location ?? null,
	homepage_url: apiUser.homepage ?? null
  });

const ArtistPage = () => {
  const { userId } = useParams<{ userId: string }>();
  const dispatch = useAppDispatch();
  const [showAddToPlaylist, setShowAddToPlaylist] = useState<PlaylistId | null>(null);
  const [loading, setLoading] = useState(true);

  const user = useAppSelector((state) => 
    userId ? state.user.users[parseInt(userId)] : null
  );

  const songs = useAppSelector((state) => {
	const allSongs = state.song.songs;
	return userId ? 
	  Object.values(allSongs)
		.filter(song => song.artist_id === parseInt(userId))
	  : [];
  });

  const userPlaylists = useAppSelector((state) => 
    Object.values(state.playlist.playlists)
  );

  useEffect(() => {
    const loadArtist = async () => {
      if (userId) {
        try {
          setLoading(true);
          const userData = await api.users.getOne(parseInt(userId));
          const storeUser = apiUserToStoreUser(userData);
          dispatch(userSlice.actions.addUser(storeUser));
          dispatch(fetchArtistSongs(parseInt(userId)));
        } catch (error) {
          console.error("Error loading artist:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadArtist();
  }, [dispatch, userId]);

  const handlePlaySong = (song: Song) => {
	if (user) {
	  const songWithUser: SongWithUser = {
		...song,
		genre: song.genre ?? null,
		thumb_url: song.thumb_url ?? null,
		created_at: song.created_at.toISOString(),
		updated_at: song.updated_at.toISOString(),
		user: {
		  id: user.id,
		  username: user.display_name,
		  stage_name: user.display_name,
		  profile_image: user.profile_image ?? null,
		},
		song_ref: song.song_url
	  };
	  dispatch(setCurrentSong(songWithUser));
	}
  };

  if (loading) {
    return (
      <Layout>
        <div className="loading-container">Loading artist profile...</div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="error-container">Artist not found</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="artist-page">
        <div className="artist-hero-container">
          <div className="artist-hero-background">
            <img
              src={user.profile_image || ""}
              alt=""
              className="hero-background-image"
            />
            <div className="hero-overlay"></div>
          </div>

          <div className="artist-hero-content">
            <div className="artist-profile">
              <div className="artist-profile-image">
                <img src={user.profile_image || ""} alt={user.display_name} />
              </div>
              <div className="artist-info">
                <h1>{user.display_name}</h1>
                {user.location && (
                  <div className="artist-meta">
                    <span className="artist-location">{user.location}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="artist-content">
          <div className="content-actions">
            <button className="play-all-button">▶ Play All</button>
          </div>

          <div className="songs-table">
            <div className="songs-header">
              <div className="song-number">#</div>
              <div className="song-title-header">Title</div>
              <div className="song-artist-header">Artist</div>
              <div className="song-genre-header">Genre</div>
              <div className="song-actions-header">Actions</div>
            </div>

            <div className="songs-list">
              {songs.map((song, index) => (
                <div key={song.id} className="song-row">
                  <div className="song-number">{index + 1}</div>
                  <div className="song-title-cell">
                    <div className="song-thumbnail">
                      {song.thumb_url && (
                        <img src={song.thumb_url} alt={song.name} />
                      )}
                    </div>
                    <span className="song-name">{song.name}</span>
                  </div>
                  <div className="song-artist">{user.display_name}</div>
                  <div className="song-genre">{song.genre}</div>
                  <div className="song-actions">
                    <button
                      className="play-song-button"
                      onClick={() => handlePlaySong(song)}
                      aria-label="Play song"
                    >
                      ▶
                    </button>
                    <button
                      className="add-to-playlist-button"
                      onClick={() => setShowAddToPlaylist(song.id)}
                      aria-label="Add to playlist"
                    >
                      +
                    </button>
                    {showAddToPlaylist === song.id && (
                      <div className="playlist-dropdown">
                        {userPlaylists.map((playlist) => (
                          <button key={playlist.id} className="playlist-option">
                            {playlist.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ArtistPage;
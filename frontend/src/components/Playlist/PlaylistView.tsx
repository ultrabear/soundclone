import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store";
import { fetchPlaylist, addSongToPlaylist } from "../../store/slices/playlistsSlice";
import { setCurrentSong } from "../../store/playerSlice";
import Layout from "../Layout/Layout";
import "./PlaylistView.css";

const PlaylistView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  
  // Updated selectors for new store structure
  const { currentPlaylist, loading, error } = useAppSelector((state) => state.playlists);
  const { userPlaylists } = useAppSelector((state) => state.playlists);
  const [showAddToPlaylist, setShowAddToPlaylist] = useState<number | null>(null);

  useEffect(() => {
    if (id) {
      dispatch(fetchPlaylist(parseInt(id)));
    }
  }, [dispatch, id]);

  const handlePlaySong = (index: number) => {
    if (currentPlaylist?.songs && currentPlaylist.songs[index]) {
      dispatch(setCurrentSong(currentPlaylist.songs[index]));
    }
  };

  const handleAddToPlaylist = (songId: number, targetPlaylistId: number) => {
    dispatch(addSongToPlaylist({ playlistId: targetPlaylistId, songId }));
    setShowAddToPlaylist(null);
  };

  if (loading) {
    return (
      <Layout>
        <div className="loading-container">Loading playlist...</div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="error-container">{error}</div>
      </Layout>
    );
  }

  if (!currentPlaylist) {
    return (
      <Layout>
        <div className="error-container">Playlist not found</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="playlist-view-wrapper">
        <div className="playlist-container">
          <div className="playlist-header">
            <div className="playlist-info">
              <div className="playlist-image">
                {currentPlaylist.thumbnail && (
                  <img
                    src={currentPlaylist.thumbnail}
                    alt={currentPlaylist.name}
                  />
                )}
              </div>
              <div className="playlist-details">
                <h1 className="playlist-name">{currentPlaylist.name}</h1>
                <div className="playlist-meta">
                  <span className="playlist-creator">
                    Created by{" "}
                    {currentPlaylist.user.stage_name ||
                      currentPlaylist.user.username}
                  </span>
                  <span className="playlist-songs-count">
                    {currentPlaylist.songs?.length || 0} songs
                  </span>
                </div>
                <button className="play-button">▶ Play All</button>
              </div>
            </div>
            <button className="share-button">Share Playlist</button>
          </div>

          <div className="songs-list">
            <div className="songs-header">
              <div className="song-number">#</div>
              <div className="song-info">Title</div>
              <div className="song-artist">Artist</div>
              <div className="song-genre">Genre</div>
              <div className="song-actions">Actions</div>
            </div>

            {currentPlaylist.songs?.map((song, index) => (
              <div key={song.id} className="song-row">
                <div className="song-number">{index + 1}</div>
                <div className="song-info">
                  <div className="song-artwork">
                    {song.thumb_url && (
                      <img src={song.thumb_url} alt={song.name} />
                    )}
                  </div>
                  <div className="song-name">{song.name}</div>
                </div>
                <div className="song-artist">
                  {song.user.stage_name || song.user.username}
                </div>
                <div className="song-genre">{song.genre}</div>
                <div className="song-actions">
                  <button
                    className="play-song-button"
                    onClick={() => handlePlaySong(index)}
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
                  {showAddToPlaylist === song.id && userPlaylists && (
                    <div className="playlist-dropdown">
                      {userPlaylists.map((playlist) => (
                        <button
                          key={playlist.id}
                          onClick={() =>
                            handleAddToPlaylist(song.id, playlist.id)
                          }
                          className="playlist-option"
                        >
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
    </Layout>
  );
};

export default PlaylistView;
import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store";
import {
  fetchFeaturedArtists,
  fetchNewReleases,
  fetchUserPlaylists,
} from "../../store/homeSlice";
import { setCurrentSong, togglePlayPause } from '../../store/playerSlice';
import { SongWithUser } from '../../types';
import Layout from "../Layout/Layout";
import { mockPlaylistData } from "../../store/playlistSlice";

interface ScrollableSectionProps {
  title: string;
  children: React.ReactNode;
  containerRef: React.RefObject<HTMLDivElement>;
}

const ScrollableSection: React.FC<ScrollableSectionProps> = ({
  title,
  children,
  containerRef,
}) => {
  const scroll = (direction: "left" | "right") => {
    if (containerRef.current) {
      const container = containerRef.current;
      const scrollAmount = container.offsetWidth * 0.8;
      const scrollTo =
        direction === "left"
          ? container.scrollLeft - scrollAmount
          : container.scrollLeft + scrollAmount;

      container.scrollTo({
        left: scrollTo,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="content-section">
      <div className="section-header">
        <h2 className="section-title">{title}</h2>
      </div>
      <div className="scroll-container">
        <div className="scroll-content" ref={containerRef}>
          {children}
        </div>
        <div className="scroll-controls">
          <button
            onClick={() => scroll("left")}
            className="scroll-button left"
            aria-label="Scroll left"
          >
            ←
          </button>
          <button
            onClick={() => scroll("right")}
            className="scroll-button right"
            aria-label="Scroll right"
          >
            →
          </button>
        </div>
      </div>
    </section>
  );
};

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { featuredArtists, newReleases, loading, error } = useAppSelector(
    (state) => state.home
  );

  const featuredRef = useRef<HTMLDivElement>(null);
  const releasesRef = useRef<HTMLDivElement>(null);

  const handlePlaySong = (song: SongWithUser) => {
    dispatch(setCurrentSong(song));
    dispatch(togglePlayPause());
  };

  useEffect(() => {
    dispatch(fetchFeaturedArtists());
    dispatch(fetchNewReleases());
    dispatch(fetchUserPlaylists());
  }, [dispatch]);

  if (loading.artists || loading.releases || loading.playlists) {
    return <Layout><div className="loading-container">Loading...</div></Layout>;
  }

  if (error.artists || error.releases || error.playlists) {
    return (
      <Layout>
        <div className="error-container">
          Error loading data. Please try again later.
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="content-section">
        <div className="section-header">
          <h2 className="section-title">More of what you like</h2>
        </div>
        <div className="hero-section">
          <div className="hero-artwork">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/0/0e/Continuum_by_John_Mayer_%282006%29.jpg"
              alt="Playlist artwork"
            />
            <button className="hero-play-button">▶</button>
          </div>
          <div className="hero-content">
            <div className="hero-songs">
              {mockPlaylistData.songs.map((song) => (
                <div key={song.id} className="hero-song-item">
                  <div className="song-info">
                    <span className="song-title">{song.name}</span>
                    <span className="song-divider">—</span>
                    <span className="song-artist">
                      {song.user.stage_name || song.user.username}
                    </span>
                  </div>
                  <button 
                    className="song-play-button"
                    onClick={() => handlePlaySong(song)}
                    aria-label="Play song"
                  >
                    ▶
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="hero-footer">
          <button
            className="view-playlist-button"
            onClick={() => navigate(`/playlist/1`)}
          >
            Go to playlist
          </button>
        </div>
      </section>

      <ScrollableSection title="Featured artists" containerRef={featuredRef}>
        {featuredArtists.map((artist) => (
          <div key={artist.id} className="artist-card">
            <div className="artist-image">
              {artist.profile_image && (
                <img src={artist.profile_image} alt={artist.username} />
              )}
            </div>
            <h3 className="artist-name">
              {artist.stage_name || artist.username}
            </h3>
            {artist.first_release && (
              <p className="artist-followers">
                Since {new Date(artist.first_release).getFullYear()}
              </p>
            )}
          </div>
        ))}
      </ScrollableSection>

      <ScrollableSection title="New releases" containerRef={releasesRef}>
        {newReleases.map((song) => (
          <div 
            key={song.id} 
            className="track-card"
            onClick={() => handlePlaySong(song as SongWithUser)}
          >
            <div className="track-artwork">
              {song.thumb_url && <img src={song.thumb_url} alt={song.name} />}
            </div>
            <h3 className="track-title">{song.name}</h3>
            {song.genre && <p className="track-artist">{song.genre}</p>}
          </div>
        ))}
      </ScrollableSection>
    </Layout>
  );
};

export default HomePage;
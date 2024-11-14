import type React from "react";
import { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store";
import { setCurrentSong, togglePlayPause } from "../../store/playerSlice";
import { mockPlaylistData } from "../../store/slices/playlistsSlice";
import { fetchNewReleases } from "../../store/slices/songsSlice";
import type { Song } from "../../store/slices/types";
import type { SongWithUser } from "../../types";
import Layout from "../Layout/Layout";
import LoginFormModal from "../LoginFormModal/LoginFormModal";
import OpenModalButton from "../OpenModalButton/OpenModalButton";
import SignupFormModal from "../SignupFormModal/SignupFormModal";
import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "../../store";

const selectSongsWithUsers = createSelector(
	[(state: RootState) => state.song.songs,
	 (state: RootState) => state.user.users],
	(songs, users): SongWithUser[] => {
	  const transformedSongs = Object.values(songs)
		.map(song => {
		  const user = users[song.artist_id];
		  if (!user) return null;
  
		  const songWithUser: SongWithUser = {
			id: song.id,
			name: song.name,
			artist_id: song.artist_id,
			song_ref: song.song_url,
			genre: song.genre ?? null,
			thumb_url: song.thumb_url ?? null,
			created_at: song.created_at.toISOString(),
			updated_at: song.updated_at.toISOString(),
			user: {
			  id: song.artist_id,
			  username: user.display_name,
			  stage_name: user.display_name,
			  profile_image: user.profile_image ?? null,
			}
		  };
		  return songWithUser;
		})
		.filter((song): song is SongWithUser => song !== null);
  
	  return transformedSongs.sort((a, b) => 
		new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
	  );
	}
  );

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
  
	const newReleases = useAppSelector(selectSongsWithUsers);
	const { user } = useAppSelector((state) => state.session);
	const users = useAppSelector((state) => state.user.users);
  
	const featuredRef = useRef<HTMLDivElement>(null);
	const releasesRef = useRef<HTMLDivElement>(null);
  
	const handlePlaySong = (song: Song) => {
		const user = users[song.artist_id];
		if (user) {
		  const songWithUser: SongWithUser = {
			...song,
			song_ref: song.song_url,
			genre: song.genre ?? null,
			thumb_url: song.thumb_url ?? null,
			created_at: song.created_at.toISOString(),
			updated_at: song.updated_at.toISOString(),
			user: {
			  id: song.artist_id,
			  username: user.display_name,
			  stage_name: user.display_name,
			  profile_image: user.profile_image ?? null,
			}
		  };
		  dispatch(setCurrentSong(songWithUser));
		  dispatch(togglePlayPause());
		}
	  };
  
	useEffect(() => {
	  dispatch(fetchNewReleases());
	}, [dispatch]);
    
	return (
	  <Layout>
		<section className="content-section">
		  <div className="section-header">
			<div className="header-content">
			  <h2 className="section-title">
				{user ? `Welcome back, ${user.username}!` : "More of what you like"}
			  </h2>
			  {!user && (
				<div className="auth-buttons">
				  <OpenModalButton
					buttonText="Log In"
					modalComponent={<LoginFormModal />}
				  />
				  <OpenModalButton
					buttonText="Sign Up"
					modalComponent={<SignupFormModal />}
				  />
				</div>
			  )}
			</div>
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
				{mockPlaylistData?.songs?.map((mockSong) => {
				  const song: Song = {
					id: mockSong.id,
					name: mockSong.name,
					artist_id: mockSong.artist_id,
					likes: 0,
					genre: mockSong.genre ?? undefined,
					thumb_url: mockSong.thumb_url,
					song_url: mockSong.song_ref,
					created_at: new Date(mockSong.created_at),
					updated_at: new Date(mockSong.updated_at)
				  };
  
				  return (
					<div key={song.id} className="hero-song-item">
					  <Link
						to={`/songs/${song.id}`}
						className="song-info"
						style={{ textDecoration: "none", color: "inherit" }}
					  >
						<span className="song-title">{song.name}</span>
						<span className="song-divider">—</span>
						<span className="song-artist">
						  {users[song.artist_id]?.display_name}
						</span>
					  </Link>
					  <button
						className="song-play-button"
						onClick={(e) => {
						  e.preventDefault();
						  handlePlaySong(song);
						}}
						aria-label="Play song"
					  >
						▶
					  </button>
					</div>
				  );
				})}
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
        {Array.from(
          new Set(newReleases.map((song) => song.artist_id))
        ).map((artistId) => {
          const artist = users[artistId];
          if (!artist) return null;
          
          return (
            <div
              key={artist.id}
              className="artist-card"
              onClick={() => navigate(`/artists/${artist.id}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  navigate(`/artists/${artist.id}`);
                }
              }}
            >
              <div className="artist-image">
                {artist.profile_image && (
                  <img src={artist.profile_image} alt={artist.display_name} />
                )}
              </div>
              <h3 className="artist-name">{artist.display_name}</h3>
            </div>
          );
        })}
      </ScrollableSection>

      <ScrollableSection title="New releases" containerRef={releasesRef}>
        {newReleases?.map((song) => (
          <Link
            key={song.id}
            to={`/songs/${song.id}`}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div className="track-card">
              <div className="track-artwork">
                {song.thumb_url && <img src={song.thumb_url} alt={song.name} />}
              </div>
              <h3 className="track-title">{song.name}</h3>
              {song.genre && <p className="track-artist">{song.genre}</p>}
            </div>
          </Link>
        ))}
      </ScrollableSection>
    </Layout>
  );
};

export default HomePage;
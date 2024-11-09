import React from "react";
import { Link } from "react-router-dom";
import { useAppSelector } from "../../store";
import NowPlaying from "../NowPlaying/NowPlaying";
import "./Layout.css";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { userPlaylists } = useAppSelector((state) => state.home);
  const { currentSong, isPlaying } = useAppSelector((state) => state.player);

  return (
    <div className="app-container">
      {/* Header Section */}
      <header className="app-header">
        <div className="header-content">
          <div className="app-logo">
            <Link to="/">
              <img src="/assets/images/soundclone_logo.png" alt="SoundClone Logo" />
            </Link>
          </div>
          <nav className="header-nav">
            <Link to="/" className="nav-link active">Home</Link>
            <Link to="/feed" className="nav-link">Feed</Link>
            <Link to="/library" className="nav-link">Library</Link>
          </nav>
          <div className="search-container">
            <input
              type="search"
              className="search-input"
              placeholder="Search for artists, bands, tracks, podcasts"
            />
          </div>
          <div className="header-actions">
            <button className="header-button button-primary">Upload</button>
            <div className="user-menu">
              <div className="user-avatar" />
              <button className="header-button button-secondary">Profile</button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Wrapper */}
      <div className="content-wrapper">
        {/* Centered content containing main content and sidebar */}
        <div className="centered-content">
          <aside className="sidebar">
            <div className="sidebar-section">
              <h2 className="sidebar-heading">Your Playlists</h2>
              {userPlaylists.map((playlist) => (
                <Link
                  key={playlist.id}
                  to={`/playlist/${playlist.id}`}
                  className="sidebar-link"
                >
                  {playlist.name}
                </Link>
              ))}
            </div>

            <div className="sidebar-section">
              <h2 className="sidebar-heading">Liked Songs</h2>
              <div className="sidebar-link placeholder">No liked songs yet</div>
            </div>
          </aside>

          <main className="main-content">{children}</main>
        </div>

        <NowPlaying
          currentSong={currentSong}
          isPlaying={isPlaying}
          className="now-playing-bar"
        />
      </div>
    </div>
  );
};

export default Layout;

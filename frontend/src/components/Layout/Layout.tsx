import { createSelector } from "@reduxjs/toolkit";
import type React from "react";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { RootState } from "../../store";
import { useAppDispatch, useAppSelector } from "../../store";
import { fetchUserPlaylists, createLikedSongsPlaylist } from "../../store/slices/playlistsSlice";
import { thunkLogout } from "../../store/slices/sessionSlice";
import LoginFormModal from "../LoginFormModal/LoginFormModal";
import NowPlaying from "../NowPlaying/NowPlaying";
import OpenModalButton from "../OpenModalButton/OpenModalButton";
import SignupFormModal from "../SignupFormModal/SignupFormModal";
import "./Layout.css";


interface LayoutProps {
	children: React.ReactNode;
	variant?: "default" | "fullWidth";
	className?: string;
	hideSidebar?: boolean;
}

const Header: React.FC = () => {
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const { user } = useAppSelector((state) => state.session);
	const userDetails = useAppSelector((state) =>
		user ? state.user.users[user.id] : null,
	);

	const handleUserProfileClick = () => {
		if (user) {
			navigate(`/user/${user.id}`);
		}
	};

	const handleLogout = () => {
		dispatch(thunkLogout());
	};

	return (
		<header className="app-header">
			<div className="header-content">
				<div className="app-logo">
					<Link to="/">
						<img
							src="/assets/images/soundclone_logo.png"
							alt="SoundClone Logo"
						/>
					</Link>
				</div>
				<nav className="header-nav">
					<Link to="/" className="nav-link active">
						Home
					</Link>
					<Link to="/feed" className="nav-link">
						Feed
					</Link>
					<Link to="/library" className="nav-link">
						Library
					</Link>
				</nav>
				<div className="search-container">
					<input
						type="search"
						className="search-input"
						placeholder="Search for artists, bands, tracks, podcasts"
					/>
				</div>
				<div className="header-actions">
					{user ? (
						<>
							<Link to="/new-song" className="header-button button-primary">
								Upload
							</Link>
							<div className="user-menu">
								<div
									className="user-avatar"
									onClick={handleUserProfileClick}
									style={{ cursor: "pointer" }}
								>
									{userDetails?.profile_image && (
										<img src={userDetails.profile_image} alt={user.username} />
									)}
								</div>
								<button
									type="button"
									className="header-button button-secondary"
									onClick={handleLogout}
								>
									Log Out
								</button>
							</div>
						</>
					) : (
						<div className="auth-buttons">
							<div className="header-button button-secondary">
								<OpenModalButton
									buttonText="Log In"
									modalComponent={<LoginFormModal />}
								/>
							</div>
							<div className="header-button button-primary">
								<OpenModalButton
									buttonText="Sign Up"
									modalComponent={<SignupFormModal />}
								/>
							</div>
						</div>
					)}
				</div>
			</div>
		</header>
	);
};

const selectAllPlaylists = createSelector(
	[(state: RootState) => state.playlist.playlists], 
	(playlists) => Object.values(playlists),
);

export const selectUserPlaylists = createSelector(
	[
	  (state: RootState) => state.playlist.playlists,
	  (state: RootState) => state.session.user?.id
	],
	(playlists, userId) => 
	  userId ? Object.values(playlists).filter(playlist => playlist.user_id === userId) : []
  );
  

  export const Sidebar: React.FC = () => {
	const dispatch = useAppDispatch();
	const { user } = useAppSelector((state) => state.session);
	const userPlaylists = useAppSelector(selectUserPlaylists);
	const likedSongs = useAppSelector((state) => state.session.likes);
	const allSongs = useAppSelector((state) => state.song.songs);
	const likedSongsPlaylist = useAppSelector((state) => 
	  state.playlist.likedSongsPlaylist ? 
	  state.playlist.playlists[state.playlist.likedSongsPlaylist] : 
	  null
	);
  
	const regularPlaylists = userPlaylists.filter(playlist => 
	  playlist.id !== likedSongsPlaylist?.id && 
	  playlist.user_id === user?.id
	);
  
	return (
	  <aside className="sidebar">
		<div className="sidebar-section">
		  <h2 className="sidebar-heading">Your Playlists</h2>
		  {user ? (
			regularPlaylists.length ? (
			  regularPlaylists.map((playlist) => (
				<Link
				  key={playlist.id}
				  to={`/playlist/${playlist.id}`}
				  className="sidebar-link"
				>
				  {playlist.name}
				</Link>
			  ))
			) : (
			  <div className="sidebar-link placeholder">No playlists yet</div>
			)
		  ) : (
			<div className="sidebar-link placeholder">
			  Log in to see your playlists
			</div>
		  )}
		</div>
  
		<div className="sidebar-section">
		  <h2 className="sidebar-heading">Liked Songs</h2>
		  {user && likedSongsPlaylist?.user_id === user.id ? (
			<Link
			  to={`/playlist/${likedSongsPlaylist.id}`}
			  className="sidebar-link liked-songs-header"
			>
			  {Object.keys(likedSongs ?? {}).length} liked songs
			</Link>
		  ) : (
			<div className="sidebar-link placeholder">
			  {user ? 'No liked songs yet' : 'Log in to see your liked songs'}
			</div>
		  )}
		</div>
	  </aside>
	);
  };

const Layout: React.FC<LayoutProps> = ({
	children,
	hideSidebar = false,
	className = "",
}) => {
	const dispatch = useAppDispatch();
	const { currentSong, isPlaying } = useAppSelector((state) => state.player);
	const { user } = useAppSelector((state) => state.session);
	const likedSongsPlaylist = useAppSelector(state => state.playlist.likedSongsPlaylist);

	useEffect(() => {
		const initializeUserData = async () => {
		  if (user && !likedSongsPlaylist) {
			try {
			  await dispatch(fetchUserPlaylists());
			  await dispatch(createLikedSongsPlaylist());
			} catch (error) {
			  console.error("Error initializing user data:", error);
			}
		  }
		};
	  
		initializeUserData();
	  }, [dispatch, user, likedSongsPlaylist]);

	return (
		<div className="app-container">
			<Header />
			<div className="content-wrapper">
				<div className={`centered-content ${className}`}>
					<main className="main-content">{children}</main>
					{!hideSidebar && <Sidebar />}
				</div>
			</div>
			<NowPlaying
				currentSong={currentSong}
				isPlaying={isPlaying}
				className="now-playing-bar"
			/>
		</div>
	);
};


export default Layout;

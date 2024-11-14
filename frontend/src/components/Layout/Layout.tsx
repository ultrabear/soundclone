import type React from "react";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store";
import { thunkLogout } from "../../store/session";
import { fetchUserPlaylists } from "../../store/slices/playlistsSlice";
import LoginFormModal from "../LoginFormModal/LoginFormModal";
import NowPlaying from "../NowPlaying/NowPlaying";
import OpenModalButton from "../OpenModalButton/OpenModalButton";
import SignupFormModal from "../SignupFormModal/SignupFormModal";
import "./Layout.css";

interface LayoutProps {
	children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
	const dispatch = useAppDispatch();
	const { userPlaylists } = useAppSelector((state) => state.playlists);
	const navigate = useNavigate();
	const { currentSong, isPlaying } = useAppSelector((state) => state.player);
	const { user } = useAppSelector((state) => state.session);

	const handleUserProfileClick = () => {
		if (user) {
			navigate(`/user/${user.id}`);
		}
	};

	useEffect(() => {
		// Only fetch playlists if user is logged in
		if (user) {
			dispatch(fetchUserPlaylists());
		}
	}, [dispatch, user]);

	const handleLogout = () => {
		dispatch(thunkLogout());
	};

	return (
		<div className="app-container">
			{/* Header Section */}
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
										{user.profile_image && (
											<img src={user.profile_image} alt={user.username} />
										)}
									</div>
									<button
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

			{/* Main Content Wrapper */}
			<div className="content-wrapper">
				{/* Centered content containing main content and sidebar */}
				<div className="centered-content">
					<main className="main-content">{children}</main>

					<aside className="sidebar">
						<div className="sidebar-section">
							<h2 className="sidebar-heading">Your Playlists</h2>
							{user ? (
								userPlaylists?.length ? (
									userPlaylists.map((playlist) => (
										<Link
											key={playlist.id}
											to={`/playlist/${playlist.id}`}
											className="sidebar-link"
										>
											{playlist.name}
										</Link>
									))
								) : (
									<div className="sidebar-link placeholder">
										No playlists yet
									</div>
								)
							) : (
								<div className="sidebar-link placeholder">
									Log in to see your playlists
								</div>
							)}
						</div>

						<div className="sidebar-section">
							<h2 className="sidebar-heading">Liked Songs</h2>
							{user ? (
								<div className="sidebar-link placeholder">
									No liked songs yet
								</div>
							) : (
								<div className="sidebar-link placeholder">
									Log in to see your liked songs
								</div>
							)}
						</div>
					</aside>
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

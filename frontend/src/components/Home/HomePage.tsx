import type React from "react";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store";
import { setCurrentSong, togglePlayPause } from "../../store/playerSlice";
import { mockPlaylistData } from "../../store/slices/playlistsSlice";
import { fetchNewReleases } from "../../store/slices/songsSlice";
import type { SongWithUser } from "../../types";
import Layout from "../Layout/Layout";
import LoginFormModal from "../LoginFormModal/LoginFormModal";
import OpenModalButton from "../OpenModalButton/OpenModalButton";
import SignupFormModal from "../SignupFormModal/SignupFormModal";

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

	//selectors
	const { loading: songsLoading, error: songsError } = useAppSelector(
		(state) => state.songs,
	);
	const { newReleases } = useAppSelector((state) => state.songs);
	const { user } = useAppSelector((state) => state.session);

	const loading = songsLoading;
	const error = songsError;

	const featuredRef = useRef<HTMLDivElement>(null);
	const releasesRef = useRef<HTMLDivElement>(null);

	const handlePlaySong = (song: SongWithUser) => {
		dispatch(setCurrentSong(song));
		dispatch(togglePlayPause());
	};

	useEffect(() => {
		dispatch(fetchNewReleases());
	}, [dispatch]);

	if (loading) {
		return (
			<Layout>
				<div className="loading-container">Loading...</div>
			</Layout>
		);
	}

	if (error) {
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
					<div className="header-content">
						<h2 className="section-title">
							{user
								? `Welcome back, ${user.username}!`
								: "More of what you like"}
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
							{mockPlaylistData?.songs?.map((song) => (
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
				{newReleases
					.filter(
						(song, index, self) =>
							index === self.findIndex((s) => s.user.id === song.user.id),
					)
					.map((song) => song.user)
					.map((artist) => (
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
									<img src={artist.profile_image} alt={artist.username} />
								)}
							</div>
							<h3 className="artist-name">
								{artist.stage_name || artist.username}
							</h3>
						</div>
					))}
			</ScrollableSection>

			<ScrollableSection title="New releases" containerRef={releasesRef}>
				{newReleases?.map((song) => (
					<div key={song.id} className="track-card">
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

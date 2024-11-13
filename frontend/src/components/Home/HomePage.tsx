import type React from "react";
import { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store";
import { setCurrentSong, togglePlayPause } from "../../store/playerSlice";
import { mockPlaylistData } from "../../store/slices/playlistsSlice";
import { fetchNewReleases } from "../../store/slices/songsSlice";
import type { SongWithUser } from "../../types";
import Layout from "../Layout/Layout";
import LoginFormModal from "../LoginFormModal/LoginFormModal";
import OpenModalButton from "../OpenModalButton/OpenModalButton";
import SignupFormModal from "../SignupFormModal/SignupFormModal";
import styles from "./HomePage.module.css";

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
		<section className={styles.scrollSection}>
			<div className={styles.sectionHeader}>
				<h2 className={styles.sectionTitle}>{title}</h2>
			</div>
			<div className={styles.scrollContainer}>
				<div className={styles.scrollContent} ref={containerRef}>
					{children}
				</div>
				<div className={styles.scrollControls}>
					<button
						onClick={() => scroll("left")}
						className={styles.scrollButtonLeft}
						aria-label="Scroll left"
					>
						←
					</button>
					<button
						onClick={() => scroll("right")}
						className={styles.scrollButtonRight}
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
				<div className={styles.loadingContainer}>Loading...</div>
			</Layout>
		);
	}

	if (error) {
		return (
			<Layout>
				<div className={styles.errorContainer}>
					Error loading data. Please try again later.
				</div>
			</Layout>
		);
	}

	return (
		<Layout>
			<div className={styles.container}>
				<section className={styles.heroWrapper}>
					<div className={styles.sectionHeader}>
						<div className={styles.headerContent}>
							<h2 className={styles.sectionTitle}>
								{user
									? `Welcome back, ${user.username}!`
									: "More of what you like"}
							</h2>
							{!user && (
								<div className={styles.authButtons}>
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
					<div className={styles.heroSection}>
						<div className={styles.heroArtwork}>
							<img
								src="https://upload.wikimedia.org/wikipedia/commons/0/0e/Continuum_by_John_Mayer_%282006%29.jpg"
								alt="Playlist artwork"
							/>
							<button className={styles.heroPlayButton}>▶</button>
						</div>
						<div className={styles.heroContent}>
							<div className={styles.heroSongs}>
								{mockPlaylistData?.songs?.map((song) => (
									<div key={song.id} className={styles.songItem}>
										<Link to={`/songs/${song.id}`} className={styles.songInfo}>
											<span className={styles.songTitle}>{song.name}</span>
											<span className={styles.songDivider}>—</span>
											<span className={styles.songArtist}>
												{song.user.stage_name || song.user.username}
											</span>
										</Link>
										<button
											className={styles.songPlayButton}
											onClick={(e) => {
												e.preventDefault();
												handlePlaySong(song);
											}}
											aria-label="Play song"
										>
											▶
										</button>
									</div>
								))}
							</div>
						</div>
					</div>
					<div className={styles.heroFooter}>
						<button
							className={styles.viewPlaylistButton}
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
								className={styles.artistCard}
								onClick={() => navigate(`/artists/${artist.id}`)}
								role="button"
								tabIndex={0}
								onKeyDown={(e) => {
									if (e.key === "Enter" || e.key === " ") {
										navigate(`/artists/${artist.id}`);
									}
								}}
							>
								<div className={styles.artistImage}>
									{artist.profile_image && (
										<img src={artist.profile_image} alt={artist.username} />
									)}
								</div>
								<h3 className={styles.artistName}>
									{artist.stage_name || artist.username}
								</h3>
							</div>
						))}
				</ScrollableSection>

				<ScrollableSection title="New releases" containerRef={releasesRef}>
					{newReleases?.map((song) => (
						<Link
							key={song.id}
							to={`/songs/${song.id}`}
							className={styles.trackCard}
						>
							<div className={styles.trackArtwork}>
								{song.thumb_url && <img src={song.thumb_url} alt={song.name} />}
							</div>
							<div className={styles.trackTitle}>{song.name}</div>
							{song.genre && (
								<div className={styles.trackArtist}>{song.genre}</div>
							)}
						</Link>
					))}
				</ScrollableSection>
			</div>
		</Layout>
	);
};

export default HomePage;

import type React from "react";
import { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store";
import { setCurrentSong, togglePlayPause } from "../../store/playerSlice";
import { fetchUserPlaylists } from "../../store/slices/playlistsSlice";
import {
	fetchNewReleases,
	selectNewestSongs,
} from "../../store/slices/songsSlice";
import type { SongId } from "../../store/slices/types";
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
						type="button"
						onClick={() => scroll("left")}
						className={styles.scrollButtonLeft}
						aria-label="Scroll left"
					>
						←
					</button>
					<button
						type="button"
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

function SongTile({
	id,
	playSong,
}: { id: SongId; playSong: (_: SongId) => void }) {
	const song = useAppSelector((state) => state.song.songs[id]);
	const artist = useAppSelector(
		(state) => state.user.users[song.artist_id].display_name,
	);

	return (
		<div key={song.id} className={styles.songItem}>
			<Link to={`/songs/${song.id}`} className={styles.songInfo}>
				<span className={styles.songTitle}>{song.name}</span>
				<span className={styles.songDivider}>—</span>
				<span className={styles.songArtist}>{artist}</span>
			</Link>
			<button
				type="button"
				className={styles.songPlayButton}
				onClick={(e) => {
					e.preventDefault();
					playSong(song.id);
				}}
				aria-label="Play song"
			>
				▶
			</button>
		</div>
	);
}

const HomePage: React.FC = () => {
	const navigate = useNavigate();
	const dispatch = useAppDispatch();

	const newReleases = useAppSelector(selectNewestSongs);
	const { user } = useAppSelector((state) => state.session);
	const users = useAppSelector((state) => state.user.users);
	const playlists = useAppSelector((state) => state.playlist.playlists);

	const featuredRef = useRef<HTMLDivElement>(null);
	const releasesRef = useRef<HTMLDivElement>(null);

	const handlePlaySong = (song: SongId) => {
		dispatch(setCurrentSong(song));
		dispatch(togglePlayPause());
	};

	useEffect(() => {
		const fetchData = async () => {
			try {
				dispatch(fetchNewReleases());

				// Fetch playlists if user is logged in
				if (user) {
					dispatch(fetchUserPlaylists());
				}
			} catch (error) {
				console.error("Error fetching data:", error);
			}
		};

		fetchData();
	}, [dispatch, user]);

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
							<button type="button" className={styles.heroPlayButton}>
								▶
							</button>
						</div>
						<div className={styles.heroContent}>
							<div className={styles.heroSongs}>
								{playlists[0]?.songs &&
									Object.keys(playlists[0].songs).map((songId) => (
										<SongTile
											key={Number(songId)}
											playSong={handlePlaySong}
											id={Number(songId)}
										/>
									))}
							</div>
						</div>
					</div>
					<div className={styles.heroFooter}>
						{playlists[0] && (
							<button
								type="button"
								className={styles.viewPlaylistButton}
								onClick={() => navigate(`/playlist/${playlists[0].id}`)}
							>
								Go to playlist
							</button>
						)}
					</div>
				</section>

				<ScrollableSection title="Featured artists" containerRef={featuredRef}>
					{Array.from(new Set(newReleases.map((song) => song.artist_id))).map(
						(artistId) => {
							const artist = users[artistId];
							if (!artist) return null;

							return (
								<button
									type="button"
									key={artist.id}
									className={styles.artistCard}
									onClick={() => navigate(`/artists/${artist.id}`)}
									tabIndex={0}
									onKeyDown={(e) => {
										if (e.key === "Enter" || e.key === " ") {
											navigate(`/artists/${artist.id}`);
										}
									}}
								>
									<div className={styles.artistImage}>
										{artist.profile_image && (
											<img
												src={artist.profile_image}
												alt={artist.display_name}
											/>
										)}
									</div>
									<h3 className={styles.artistName}>{artist.display_name}</h3>
								</button>
							);
						},
					)}
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

import type React from "react";
import { useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store";
import {
	setCurrentSong,
	togglePlayPause,
	clearQueue,
	addToQueue,
} from "../../store/playerSlice";
import { fetchUserPlaylists } from "../../store/slices/playlistsSlice";
import {
	fetchNewReleases,
	selectNewestSongs,
} from "../../store/slices/songsSlice";
import { selectTop10NewestSongs } from "../../store/selectors/songSelectors";
import type { SongId } from "../../store/slices/types";
import Layout from "../Layout/Layout";
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
}: {
	id: SongId;
	playSong: (_: SongId) => void;
}) {
	const song = useAppSelector((state) => state.song.songs[id]);
	const artist = useAppSelector((state) =>
		song ? state.user.users[song.artist_id]?.display_name : null,
	);
	const isPlaying = useAppSelector((state) => state.player.isPlaying);
	const currentSong = useAppSelector((state) => state.player.currentSong);
	const isCurrentSong = currentSong === id;

	const handlePlay = (e: React.MouseEvent) => {
		e.preventDefault();
		playSong(id);
	};

	if (!(song && artist)) {
		return <div className={styles.songItem}>Loading Song/Artist...</div>;
	}

	return (
		<div className={styles.songItem}>
			<Link to={`/songs/${song.id}`} className={styles.songInfo}>
				<span className={styles.songTitle}>{song.name}</span>
				<span className={styles.songDivider}>—</span>
				<span className={styles.songArtist}>{artist}</span>
			</Link>
			<button
				type="button"
				className={styles.songPlayButton}
				onClick={handlePlay}
				aria-label={isCurrentSong && isPlaying ? "Pause" : "Play"}
			>
				{isCurrentSong && isPlaying ? "⏸" : "▶"}
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

	const featuredRef = useRef<HTMLDivElement>(null);
	const releasesRef = useRef<HTMLDivElement>(null);

	const top10Songs = useAppSelector(selectTop10NewestSongs);
	const isPlaying = useAppSelector((state) => state.player.isPlaying);
	const currentSong = useAppSelector((state) => state.player.currentSong);

	const handlePlaySong = (clickedSongId: SongId) => {
		const songIndex = top10Songs.findIndex((song) => song.id === clickedSongId);
		if (songIndex !== -1) {
			if (currentSong === clickedSongId) {
				// If it's the same song, just toggle play/pause
				dispatch(togglePlayPause());
			} else {
				if (!isPlaying) {
					dispatch(togglePlayPause());
				}
				dispatch(setCurrentSong(clickedSongId));
				dispatch(clearQueue());

				top10Songs.slice(songIndex + 1).forEach((song) => {
					dispatch(addToQueue(song.id));
				});
			}
		}
	};

	const handlePlayAll = useCallback(() => {
		const firstSong = top10Songs[0];
		if (firstSong) {
			if (currentSong === firstSong.id) {
				dispatch(togglePlayPause());
			} else {
				if (!isPlaying) {
					dispatch(togglePlayPause());
				}
				dispatch(setCurrentSong(firstSong.id));
				dispatch(clearQueue());

				top10Songs.slice(1).forEach((song) => {
					dispatch(addToQueue(song.id));
				});
			}
		}
	}, [dispatch, top10Songs, isPlaying, currentSong]);

	useEffect(() => {
		const fetchData = async () => {
			try {
				dispatch(fetchNewReleases());

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
								{user ? `Welcome back, ${user.username}!` : "Latest Releases"}
							</h2>
						</div>
					</div>
					<div className={styles.heroSection}>
						<div className={styles.heroArtwork}>
							<img
								src="https://soundclone-image-files.s3.us-east-1.amazonaws.com/fresh_10_playlist_art.png"
								alt="New releases playlist"
								className={styles.heroImage}
							/>
							<button
								type="button"
								className={styles.heroPlayButton}
								onClick={handlePlayAll}
								aria-label={
									isPlaying && currentSong === top10Songs[0]?.id
										? "Pause"
										: "Play"
								}
							>
								{isPlaying && currentSong === top10Songs[0]?.id ? "⏸" : "▶"}
							</button>
						</div>
						<div className={styles.heroContent}>
							<div className={styles.heroSongs}>
								{top10Songs.map((song) => (
									<SongTile
										key={song.id}
										id={song.id}
										playSong={handlePlaySong}
									/>
								))}
							</div>
						</div>
					</div>
					<div className={styles.heroFooter}>
						<p className={styles.playlistDescription}>
							Fresh tracks from our community - updated in real-time
						</p>
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

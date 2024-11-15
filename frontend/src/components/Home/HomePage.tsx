import type React from "react";
import { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store";
import { setCurrentSong, togglePlayPause } from "../../store/playerSlice";
import { fetchNewReleases } from "../../store/slices/songsSlice";
import { fetchUserPlaylists } from "../../store/slices/playlistsSlice";
import type { SongWithUser } from "../../types";
import Layout from "../Layout/Layout";
import LoginFormModal from "../LoginFormModal/LoginFormModal";
import OpenModalButton from "../OpenModalButton/OpenModalButton";
import SignupFormModal from "../SignupFormModal/SignupFormModal";
import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "../../store";
import styles from "./HomePage.module.css";

// Selectors
const selectCurrentUserPlaylists = createSelector(
	[(state: RootState) => state.playlist.playlists],
	(playlists) => Object.values(playlists),
);

const selectSongsWithUsers = createSelector(
	[
		(state: RootState) => state.song.songs,
		(state: RootState) => state.user.users,
	],
	(songs, users): SongWithUser[] => {
		const transformedSongs = Object.values(songs)
			.map((song) => {
				const user = users[song.artist_id];
				if (!user) return null;

				const songWithUser: SongWithUser = {
					id: song.id,
					name: song.name,
					artist_id: song.artist_id,
					song_ref: song.song_url,
					genre: song.genre ?? null,
					thumb_url: song.thumb_url ?? null,
					created_at: song.created_at,
					updated_at: song.updated_at,
					user: {
						id: song.artist_id,
						username: user.display_name,
						stage_name: user.display_name,
						profile_image: user.profile_image ?? null,
					},
				};
				return songWithUser;
			})
			.filter((song): song is SongWithUser => song !== null);

		return transformedSongs.sort(
			(a, b) =>
				new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
		);
	},
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

const HomePage: React.FC = () => {
	const navigate = useNavigate();
	const dispatch = useAppDispatch();

	const newReleases = useAppSelector(selectSongsWithUsers);
	const { user } = useAppSelector((state) => state.session);
	const users = useAppSelector((state) => state.user.users);
	const playlists = useAppSelector(selectCurrentUserPlaylists);

	const featuredRef = useRef<HTMLDivElement>(null);
	const releasesRef = useRef<HTMLDivElement>(null);

	const handlePlaySong = (songWithUser: SongWithUser) => {
		dispatch(setCurrentSong(songWithUser.id));
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
									Object.keys(playlists[0].songs).map((songId) => {
										const song = newReleases.find(
											(s) => s.id === Number(songId),
										);
										if (!song) return null;

										return (
											<div key={song.id} className={styles.songItem}>
												<Link
													to={`/songs/${song.id}`}
													className={styles.songInfo}
												>
													<span className={styles.songTitle}>{song.name}</span>
													<span className={styles.songDivider}>—</span>
													<span className={styles.songArtist}>
														{song.user.stage_name || song.user.username}
													</span>
												</Link>
												<button
													type="button"
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
										);
									})}
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

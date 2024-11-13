import type React from "react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store";
import { setCurrentSong } from "../../store/playerSlice";
import { fetchArtistSongs } from "../../store/slices/songsSlice";
import type { User } from "../../types";
import Layout from "../Layout/Layout";
import { api } from "../../store/api";
import styles from "./ArtistPage.module.css";

//convert API user data to frontend User type
const transformUser = (apiUser: any): User => ({
	id: apiUser.id,
	username: apiUser.username,
	email: apiUser.email,
	profile_image: apiUser.profile_image ?? null,
	stage_name: apiUser.stage_name ?? null,
	first_release: apiUser.first_release ?? null,
	biography: apiUser.biography ?? null,
	location: apiUser.location ?? null,
	homepage: apiUser.homepage ?? null,
});

const ArtistPage: React.FC = () => {
	const { userId } = useParams<{ userId: string }>();
	const dispatch = useAppDispatch();
	const [showAddToPlaylist, setShowAddToPlaylist] = useState<number | null>(
		null,
	);
	const [artist, setArtist] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	const { artistSongs, loading: songsLoading } = useAppSelector(
		(state) => state.songs,
	);
	const { userPlaylists } = useAppSelector((state) => state.playlists);

	useEffect(() => {
		const loadArtist = async () => {
			if (userId) {
				try {
					setLoading(true);
					const userData = await api.users.getOne(Number.parseInt(userId));
					setArtist(transformUser(userData));
					dispatch(fetchArtistSongs(Number.parseInt(userId)));
				} catch (error) {
					console.error("Error loading artist:", error);
				} finally {
					setLoading(false);
				}
			}
		};

		loadArtist();
	}, [dispatch, userId]);

	const handlePlaySong = (index: number) => {
		if (artistSongs[index]) {
			dispatch(setCurrentSong(artistSongs[index]));
		}
	};

	if (loading || songsLoading) {
		return (
			<Layout>
				<div className={styles.loadingContainer}>Loading artist profile...</div>
			</Layout>
		);
	}

	if (!artist) {
		return (
			<Layout>
				<div className={styles.errorContainer}>Artist not found</div>
			</Layout>
		);
	}

	return (
		<Layout>
			<div className={styles.container}>
				<div className={styles.heroContainer}>
					<div className={styles.heroBackground}>
						<img
							src={artist.profile_image || ""}
							alt=""
							className={styles.backgroundImage}
						/>
						<div className={styles.overlay}></div>
					</div>

					<div className={styles.heroContent}>
						<div className={styles.profile}>
							<div className={styles.profileImage}>
								<img src={artist.profile_image || ""} alt={artist.username} />
							</div>
							<div className={styles.info}>
								<h1 className={styles.name}>
									{artist.stage_name || artist.username}
								</h1>
								{artist.location && (
									<div className={styles.meta}>
										<span className={styles.location}>{artist.location}</span>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>

				<div className={styles.content}>
					<div className={styles.contentActions}>
						<button className={styles.playAllButton}>▶ Play All</button>
					</div>

					<div className={styles.songsTable}>
						<div className={styles.songsHeader}>
							<div className={styles.songNumber}>#</div>
							<div>Title</div>
							<div>Artist</div>
							<div>Genre</div>
							<div>Actions</div>
						</div>

						<div className={styles.songsList}>
							{artistSongs.map((song, index) => (
								<div key={song.id} className={styles.songRow}>
									<div className={styles.songNumber}>{index + 1}</div>
									<div className={styles.songTitleCell}>
										<div className={styles.songThumbnail}>
											{song.thumb_url && (
												<img src={song.thumb_url} alt={song.name} />
											)}
										</div>
										<span className={styles.songName}>{song.name}</span>
									</div>
									<div className={styles.songArtist}>
										{song.user.stage_name || song.user.username}
									</div>
									<div className={styles.songGenre}>{song.genre}</div>
									<div className={styles.songActions}>
										<button
											className={styles.actionButton}
											onClick={() => handlePlaySong(index)}
											aria-label="Play song"
										>
											▶
										</button>
										<button
											className={styles.actionButton}
											onClick={() => setShowAddToPlaylist(song.id)}
											aria-label="Add to playlist"
										>
											+
										</button>
										{showAddToPlaylist === song.id && userPlaylists && (
											<div className={styles.playlistDropdown}>
												{userPlaylists.map((playlist) => (
													<button
														key={playlist.id}
														className={styles.playlistOption}
													>
														{playlist.name}
													</button>
												))}
											</div>
										)}
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</Layout>
	);
};

export default ArtistPage;

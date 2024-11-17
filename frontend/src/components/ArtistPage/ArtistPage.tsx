import type React from "react";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store";
import {
	fetchArtistSongs,
	selectSongsByArtist,
} from "../../store/slices/songsSlice";
import Layout from "../Layout/Layout";
import styles from "./ArtistPage.module.css";
import { SongListItem } from "../SongListItem";

const ArtistPage: React.FC = () => {
	const { userId } = useParams<{ userId: string }>();
	const dispatch = useAppDispatch();
	const [loaded, setLoaded] = useState(false);
	const [showToast, setShowToast] = useState(false);
	const [toastMessage, setToastMessage] = useState("");

	// Selectors
	const artist = useAppSelector((state) =>
		userId ? state.user.users[Number.parseInt(userId)] : null,
	);
	const songs = useAppSelector((state) =>
		selectSongsByArtist(state, Number(userId)),
	);

	const showToastMessage = (message: string) => {
		setToastMessage(message);
		setShowToast(true);
		setTimeout(() => setShowToast(false), 2000);
	};

	if (!loaded) {
		setLoaded(true);
		(async () => {
			try {
				await dispatch(fetchArtistSongs(Number(userId)));
			} catch (error) {
				console.error("Error loading artist:", error);
				showToastMessage("Failed to load artist data");
			}
		})();
	}
	if (!artist) {
		return (
			<Layout>
				<div className={styles.errorContainer}>Artist loading</div>
			</Layout>
		);
	}

	return (
		<Layout>
			<div className={styles.container}>
				{showToast && (
					<div className={styles.toastNotification}>{toastMessage}</div>
				)}
				<div className={styles.heroContainer}>
					<div className={styles.heroBackground}>
						<img
							src={artist.profile_image || ""}
							alt=""
							className={styles.backgroundImage}
						/>
						<div className={styles.overlay} />
					</div>

					<div className={styles.heroContent}>
						<div className={styles.profile}>
							<div className={styles.profileImage}>
								<img
									src={artist.profile_image || ""}
									alt={artist.display_name}
								/>
							</div>
							<div className={styles.info}>
								<h1 className={styles.name}>{artist.display_name}</h1>
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
						<button type="button" className={styles.playAllButton}>
							▶ Play All
						</button>
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
							{songs.map((song, index) => (
								<SongListItem
									key={song.id}
									songId={song.id}
									index={index}
									showToastMessage={showToastMessage}
								/>
							))}
						</div>
					</div>
				</div>
			</div>
		</Layout>
	);
};

export default ArtistPage;

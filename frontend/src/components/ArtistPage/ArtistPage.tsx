import type React from "react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store";
import { setCurrentSong } from "../../store/playerSlice";
import type { PlaylistId } from "../../store/slices/types";
import type { SongWithUser } from "../../types";
import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "../../store";
import Layout from "../Layout/Layout";
import styles from "./ArtistPage.module.css";
import { getUserDetails } from "../../store/slices/userSlice";
import { addSongs } from "../../store/slices/songsSlice";

const selectArtistSongs = createSelector(
	[
		(state: RootState) => state.song.songs,
		(state: RootState) => state.user.users,
		(_: RootState, artistId: string | undefined) => artistId,
	],
	(songs, users, artistId): SongWithUser[] => {
		if (!artistId) return [];

		const parsedId = parseInt(artistId);
		const artist = users[parsedId];
		if (!artist) return [];

		return Object.values(songs)
			.filter((song) => song.artist_id === parsedId)
			.map((song) => ({
				...song,
				song_ref: song.song_url,
				genre: song.genre ?? null,
				thumb_url: song.thumb_url ?? null,
				created_at: song.created_at,
				updated_at: song.updated_at,
				user: {
					id: artist.id,
					username: artist.display_name,
					stage_name: artist.display_name,
					profile_image: artist.profile_image ?? null,
				},
			}));
	},
);

const ArtistPage: React.FC = () => {
	const { userId } = useParams<{ userId: string }>();
	const dispatch = useAppDispatch();
	const [showAddToPlaylist, setShowAddToPlaylist] = useState<PlaylistId | null>(
		null,
	);
	const [loading, setLoading] = useState(true);

	const artist = useAppSelector((state) =>
		userId ? state.user.users[parseInt(userId)] : null,
	);
	const songs = useAppSelector((state) => selectArtistSongs(state, userId));
	const userPlaylists = useAppSelector((state) =>
		Object.values(state.playlist.playlists),
	);

	useEffect(() => {
		const loadArtist = async () => {
			if (userId) {
				try {
					setLoading(true);
					await dispatch(getUserDetails(parseInt(userId)));
					const response = await fetch(`/api/songs?artist_id=${userId}`);
					const songsData = await response.json();
					dispatch(addSongs(songsData.songs));
				} catch (error) {
					console.error("Error loading artist:", error);
				} finally {
					setLoading(false);
				}
			}
		};

		loadArtist();
	}, [dispatch, userId]);

	const handlePlaySong = (songWithUser: SongWithUser) => {
		if (artist) {
			dispatch(setCurrentSong(songWithUser as any));
		}
	};

	if (loading) {
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
							{songs.map((song, index) => (
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
									<div className={styles.songArtist}>{artist.display_name}</div>
									<div className={styles.songGenre}>{song.genre}</div>
									<div className={styles.songActions}>
										<button
											className={styles.actionButton}
											onClick={() => handlePlaySong(song)}
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
										{showAddToPlaylist === song.id && (
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

import type React from "react";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store";
import { setCurrentSong } from "../../store/playerSlice";
import { addSongs, selectSongsByArtist } from "../../store/slices/songsSlice";
import { updateLikedSongsPlaylist } from "../../store/slices/playlistsSlice";
import type { PlaylistId } from "../../store/slices/types";
import type { SongId } from "../../store/slices/types";
import { getUserDetails } from "../../store/slices/userSlice";
import { api } from "../../store/api";
import Layout from "../Layout/Layout";
import styles from "./ArtistPage.module.css";

const ArtistPage: React.FC = () => {
	const { userId } = useParams<{ userId: string }>();
	const navigate = useNavigate();
	const dispatch = useAppDispatch();
	const [showAddToPlaylist, setShowAddToPlaylist] = useState<PlaylistId | null>(null);
	const [loading, setLoading] = useState(true);
	const [newPlaylistName, setNewPlaylistName] = useState<string>("");
	const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);
	const [isLiking, setIsLiking] = useState<Record<number, boolean>>({});
	const [showToast, setShowToast] = useState(false);
	const [toastMessage, setToastMessage] = useState("");

	const artist = useAppSelector((state) =>
		userId ? state.user.users[Number.parseInt(userId)] : null,
	);
	const songs = useAppSelector((state) =>
		selectSongsByArtist(state, Number(userId)),
	);
	const userPlaylists = useAppSelector((state) =>
		Object.values(state.playlist.playlists),
	);
	const { user } = useAppSelector((state) => state.session);
	const likedSongs = useAppSelector((state) => state.session.likes);

	const showToastMessage = (message: string) => {
		setToastMessage(message);
		setShowToast(true);
		setTimeout(() => setShowToast(false), 2000);
	};

	useEffect(() => {
		const loadArtist = async () => {
			if (userId) {
				try {
					setLoading(true);
					await dispatch(getUserDetails(Number.parseInt(userId)));
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

	const handlePlaySong = (songId: SongId) => {
		if (artist) {
			dispatch(setCurrentSong(songId));
		}
	};

	const [lastLikedSongId, setLastLikedSongId] = useState<number | null>(null);


	const handleLikeSong = async (songId: number) => {
		if (!user) {
			showToastMessage("Please log in to like songs");
			return;
		}

		if (isLiking[songId]) return;

		try {
			setIsLiking(prev => ({ ...prev, [songId]: true }));
			const isLiked = songId in (likedSongs ?? {});

			await api.likes.toggleLike(songId, isLiked ? "DELETE" : "POST");
			await dispatch(updateLikedSongsPlaylist(songId)).unwrap();

			showToastMessage(isLiked ? "Song removed from likes!" : "Song added to likes!");
		} catch (error) {
			console.error("Error toggling like:", error);
			showToastMessage("Error updating like status");
			setLastLikedSongId(songId);
		
		} finally {
			setIsLiking(prev => ({ ...prev, [songId]: false }));
		}
	};

	const handleAddToPlaylist = async (playlistId: number, songId: number, playlistName: string) => {
		try {
			await api.playlists.addSong(playlistId, songId);
			setShowAddToPlaylist(null);
			showToastMessage(`Added song to ${playlistName}`);
		} catch (error) {
			console.error('Error adding song to playlist:', error);
			showToastMessage('Failed to add song to playlist');
		}
	};

	const handleCreateNewPlaylist = async (songId: number) => {
		if (!newPlaylistName.trim()) return;
		
		try {
			const response = await api.playlists.create({
				name: newPlaylistName
			});
			
			await api.playlists.addSong(response.id, songId);
			setShowAddToPlaylist(null);
			setIsCreatingPlaylist(false);
			setNewPlaylistName("");
			showToastMessage("Playlist created successfully!");
			navigate(`/playlist/${response.id}/edit`);
		} catch (error) {
			console.error("Error creating playlist:", error);
			showToastMessage("Failed to create playlist");
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
				{showToast && <div className={styles.toastNotification}>{toastMessage}</div>}
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
  										{showToast && song.id === lastLikedSongId && (
   										 <div className={styles.toastNotification}>{toastMessage}</div>
 											 )}
  										<button
   											 type="button"
   												 className={`${styles.actionButton} ${song.id in (likedSongs ?? {}) ? styles.liked : ''}`}
   												 onClick={() => handleLikeSong(song.id)}
    											disabled={isLiking[song.id]}
   												 aria-label={song.id in (likedSongs ?? {}) ? "Unlike song" : "Like song"}
 												>
  													  ♥
 												 </button>
										<button
											type="button"
											className={styles.actionButton}
											onClick={() => handlePlaySong(song.id)}
											aria-label="Play song"
										>
											▶
										</button>
										<button
											type="button"
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
														type="button"
														key={playlist.id}
														className={styles.playlistOption}
														onClick={() => handleAddToPlaylist(playlist.id, song.id, playlist.name)}
													>
														{playlist.name}
													</button>
												))}
												{isCreatingPlaylist ? (
													<div className={styles.playlistOption}>
														<input
															type="text"
															value={newPlaylistName}
															onChange={(e) => setNewPlaylistName(e.target.value)}
															placeholder="Enter playlist name"
															autoFocus
															onKeyPress={(e) => {
																if (e.key === 'Enter') {
																	handleCreateNewPlaylist(song.id);
																}
															}}
														/>
													</div>
												) : (
													<button
														type="button"
														className={`${styles.playlistOption} ${styles.createNewPlaylist}`}
														onClick={() => setIsCreatingPlaylist(true)}
													>
														Create New Playlist
													</button>
												)}
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
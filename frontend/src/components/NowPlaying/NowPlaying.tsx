import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store";
import { togglePlayPause } from "../../store/playerSlice";
import AudioService from "../../services/AudioService";
import "./NowPlaying.css";
import { api } from "../../store/api";
import { likeSong, unlikeSong } from "../../store/slices/songsSlice";

interface NowPlayingProps {
	currentSong: number | null;
	isPlaying: boolean;
	className?: string;
}

const NowPlaying: React.FC<NowPlayingProps> = ({
	currentSong: songId,
	isPlaying,
	className = "",
}) => {
	const dispatch = useAppDispatch();

	const [currentTime, setCurrentTime] = useState(() =>
		AudioService.getCurrentTime(),
	);
	const [duration, setDuration] = useState(() => AudioService.getDuration());
	const [volume, setVolume] = useState(() => AudioService.getVolume());

	const [showToast, setShowToast] = useState(false);
	const [toastMessage, setToastMessage] = useState("");
	const [showAddToPlaylist, setShowAddToPlaylist] = useState<boolean>(false);
	const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);
	const [newPlaylistName, setNewPlaylistName] = useState("");

	const progressRef = useRef<HTMLDivElement>(null);
	const volumeRef = useRef<HTMLDivElement>(null);

	const currentSongData = useAppSelector((state) =>
		songId ? state.song.songs[songId] : null,
	);

	const songArtist = useAppSelector((state) =>
		currentSongData ? state.user.users[currentSongData.artist_id] : null,
	);

	const { user } = useAppSelector((state) => state.session);
	const isLiked = useAppSelector((state) =>
		songId ? songId in state.session.likes : false,
	);
	const userPlaylists = useAppSelector((state) =>
		user
			? Object.values(state.playlist.playlists).filter(
					(p) => p.user_id === user.id,
				)
			: [],
	);

	const showToastMessage = (message: string) => {
		setToastMessage(message);
		setShowToast(true);
		setTimeout(() => setShowToast(false), 2000);
	};

	useEffect(() => {
		if (currentSongData?.song_url) {
			console.log("[NowPlaying] Setting song:", currentSongData.name);
			AudioService.setSource(currentSongData.song_url);
		}
	}, [currentSongData]);

	useEffect(() => {
		console.log("[NowPlaying] Play state changed:", isPlaying);
		if (isPlaying) {
			AudioService.play().catch((e) => console.error("Play error:", e));
		} else {
			AudioService.pause();
		}
	}, [isPlaying]);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			const target = event.target as HTMLElement;
			if (!target.closest(".playlist-button-container")) {
				setShowAddToPlaylist(false);
				setIsCreatingPlaylist(false);
			}
		};

		if (showAddToPlaylist) {
			document.addEventListener("click", handleClickOutside);
		}

		return () => {
			document.removeEventListener("click", handleClickOutside);
		};
	}, [showAddToPlaylist]);

	useEffect(() => {
		setCurrentTime(AudioService.getCurrentTime());
		setDuration(AudioService.getDuration());
		setVolume(AudioService.getVolume());

		const timeCleanup = AudioService.onTimeUpdate(setCurrentTime);
		const durationCleanup = AudioService.onDurationChange(setDuration);
		const volumeCleanup = AudioService.onVolumeChange(setVolume);

		return () => {
			timeCleanup();
			durationCleanup();
			volumeCleanup();
		};
	}, []);

	const handleTogglePlay = () => {
		dispatch(togglePlayPause());
	};

	const handleProgress = (e: React.MouseEvent<HTMLDivElement>) => {
		if (progressRef.current && duration) {
			const rect = progressRef.current.getBoundingClientRect();
			const x = e.clientX - rect.left;
			const percentage = x / rect.width;
			const newTime = percentage * duration;
			AudioService.setCurrentTime(newTime);
		}
	};

	const handleVolumeChange = (e: React.MouseEvent<HTMLDivElement>) => {
		if (volumeRef.current) {
			const rect = volumeRef.current.getBoundingClientRect();
			const x = e.clientX - rect.left;
			const newVolume = Math.max(0, Math.min(1, x / rect.width));
			AudioService.setVolume(newVolume);
			setVolume(newVolume);
		}
	};

	const formatTime = (time: number) => {
		const minutes = Math.floor(time / 60);
		const seconds = Math.floor(time % 60);
		return `${minutes}:${seconds.toString().padStart(2, "0")}`;
	};

	const handleLikeToggle = async () => {
		if (!user || !songId) {
			showToastMessage("Please log in to like songs");
			return;
		}

		try {
			if (isLiked) {
				dispatch(unlikeSong(songId));
				showToastMessage("Removed from liked songs");
			} else {
				dispatch(likeSong(songId));
				showToastMessage("Added to liked songs");
			}
		} catch (error) {
			showToastMessage("Failed to update like status");
			console.error("Error updating like status:", error);
		}
	};

	const handleAddToPlaylist = async (
		playlistId: number,
		playlistName: string,
	) => {
		if (!songId) return;

		try {
			await api.playlists.addSong(playlistId, songId);
			setShowAddToPlaylist(false);
			showToastMessage(`Added to ${playlistName}`);
		} catch (error) {
			console.error("Error adding song to playlist:", error);
			showToastMessage("Failed to add song to playlist");
		}
	};

	const handleCreateNewPlaylist = async () => {
		if (!newPlaylistName.trim() || !songId) return;

		try {
			const response = await api.playlists.create({
				name: newPlaylistName,
			});

			await api.playlists.addSong(response.id, songId);
			setShowAddToPlaylist(false);
			setIsCreatingPlaylist(false);
			setNewPlaylistName("");
			showToastMessage("Added to new playlist!");
		} catch (error) {
			console.error("Error creating playlist:", error);
			showToastMessage("Failed to create playlist");
		}
	};

	return (
		<>
			{showToast && <div className="toast-notification">{toastMessage}</div>}
			<div className={`now-playing ${className}`}>
				<div className="now-playing-inner">
					{currentSongData && songArtist ? (
						<>
							<div className="now-playing-left">
								<Link
									to={`/songs/${currentSongData.id}`}
									className="now-playing-art"
								>
									<img
										src={currentSongData.thumb_url || "/default-album-art.png"}
										alt={currentSongData.name}
									/>
								</Link>

								<div className="now-playing-info">
									<Link
										to={`/songs/${currentSongData.id}`}
										className="song-name"
									>
										{currentSongData.name}
									</Link>
									<Link
										to={`/artists/${songArtist.id}`}
										className="artist-name"
									>
										{songArtist.display_name}
									</Link>
								</div>

								<div className="now-playing-actions">
									<button
										type="button"
										className={`like-button ${isLiked ? "liked" : ""}`}
										onClick={handleLikeToggle}
										aria-label={isLiked ? "Unlike" : "Like"}
									>
										{isLiked ? "❤️" : "♡"}
									</button>

									<div className="playlist-button-container">
										<button
											type="button"
											className="add-to-playlist-button"
											onClick={(e) => {
												e.stopPropagation();
												setShowAddToPlaylist(!showAddToPlaylist);
											}}
											aria-label="Add to playlist"
										>
											+
										</button>

										{/* Popover Menu */}
										{showAddToPlaylist && (
											<div
												className="playlist-popup"
												onClick={(e) => e.stopPropagation()}
											>
												{userPlaylists.map((playlist) => (
													<button
														key={playlist.id}
														type="button"
														className="playlist-option"
														onClick={() =>
															handleAddToPlaylist(playlist.id, playlist.name)
														}
													>
														{playlist.name}
													</button>
												))}

												{isCreatingPlaylist ? (
													<div className="playlist-option">
														<input
															type="text"
															value={newPlaylistName}
															onChange={(e) =>
																setNewPlaylistName(e.target.value)
															}
															placeholder="Enter playlist name"
															autoFocus
															onKeyPress={(e) => {
																if (e.key === "Enter") {
																	handleCreateNewPlaylist();
																}
															}}
														/>
													</div>
												) : (
													<button
														type="button"
														className="playlist-option create-new"
														onClick={() => setIsCreatingPlaylist(true)}
													>
														Create New Playlist
													</button>
												)}
											</div>
										)}
									</div>
								</div>
							</div>

							<div className="now-playing-center">
								<div className="playback-controls">
									<button
										type="button"
										className="control-button play-button"
										onClick={handleTogglePlay}
										aria-label={isPlaying ? "Pause" : "Play"}
									>
										{isPlaying ? "⏸" : "▶"}
									</button>
								</div>

								<div className="progress-bar-container">
									<span className="time">{formatTime(currentTime)}</span>
									<div
										className="progress-bar"
										ref={progressRef}
										onClick={handleProgress}
									>
										<div
											className="progress-bar-fill"
											style={{
												width: `${
													duration ? (currentTime / duration) * 100 : 0
												}%`,
											}}
										/>
									</div>
									<span className="time">{formatTime(duration)}</span>
								</div>
							</div>

							<div className="now-playing-right">
								<div className="volume-control">
									<button
										type="button"
										className="volume-button"
										aria-label="Volume"
									>
										🔊
									</button>
									<div className="volume-slider-container">
										<div
											className="volume-slider"
											ref={volumeRef}
											onClick={handleVolumeChange}
										>
											<div
												className="volume-slider-fill"
												style={{ width: `${volume * 100}%` }}
											/>
										</div>
									</div>
								</div>
							</div>
						</>
					) : (
						<div className="no-song-playing">No track currently playing</div>
					)}
				</div>
			</div>
		</>
	);
};

export default NowPlaying;

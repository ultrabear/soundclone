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

	useEffect(() => {
		console.log("NowPlaying component state:", {
			user,
			songId,
			isLiked,
		});
	}, [user, songId, isLiked]);

	useEffect(() => {
		if (currentSongData?.song_url) {
			console.log("[NowPlaying] Setting song:", currentSongData.name);
			AudioService.setSource(currentSongData.song_url);
		}
	}, [currentSongData]);

	//  play/pause state
	useEffect(() => {
		console.log("[NowPlaying] Play state changed:", isPlaying);
		if (isPlaying) {
			AudioService.play().catch((e) => console.error("Play error:", e));
		} else {
			AudioService.pause();
		}
	}, [isPlaying]);

	// time and duration listeners
	useEffect(() => {
		// sync with current audio state
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
		console.log("Like toggle - Initial state:", {
			user,
			songId,
			isLiked,
		});

		if (!user || !songId) {
			setToastMessage("Please log in to like songs");
			setShowToast(true);
			setTimeout(() => setShowToast(false), 2000);
			return;
		}

		try {
			const method = isLiked ? "DELETE" : "POST";
			console.log(`Attempting ${method} request for song ${songId}`);

			// Update Redux first
			if (isLiked) {
				dispatch(unlikeSong(songId));
				await api.likes.toggleLike(songId, "DELETE");
			} else {
				dispatch(likeSong(songId));
				await api.likes.toggleLike(songId, "POST");
			}

			setToastMessage(
				isLiked ? "Song removed from likes!" : "Song added to likes!",
			);
			setShowToast(true);
		} catch (e) {
			// Type assertion for error
			const error = e as {
				message?: string;
				api?: { message: string };
				response?: { status: number };
			};

			console.error("Like toggle error:", {
				message: error.message || "Unknown error",
				apiError: error.api || {},
				status: error.response?.status,
			});

			// Revert Redux state on error
			if (isLiked) {
				dispatch(likeSong(songId));
			} else {
				dispatch(unlikeSong(songId));
			}
			setToastMessage("Error updating like status");
			setShowToast(true);
		} finally {
			setTimeout(() => setShowToast(false), 2000);
		}
	};

	return (
		<div className={`now-playing ${className}`}>
			{showToast && <div className="toast-notification">{toastMessage}</div>}
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
								<Link to={`/songs/${currentSongData.id}`} className="song-name">
									{currentSongData.name}
								</Link>
								<Link to={`/artists/${songArtist.id}`} className="artist-name">
									{songArtist.display_name}
								</Link>
							</div>
							<button
								type="button"
								className={`like-button ${isLiked ? "liked" : ""}`}
								onClick={handleLikeToggle}
								aria-label={isLiked ? "Unlike" : "Like"}
							>
								{isLiked ? "❤️" : "♡"}
							</button>
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
											width: `${duration ? (currentTime / duration) * 100 : 0}%`,
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
	);
};

export default NowPlaying;

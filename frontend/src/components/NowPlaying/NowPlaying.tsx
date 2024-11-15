import type React from "react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store";
import { togglePlayPause } from "../../store/playerSlice";
import "./NowPlaying.css";
import type { SongId } from "../../store/slices/types";

interface NowPlayingProps {
	currentSong: SongId | null;
	isPlaying: boolean;
	className?: string;
}

const NowPlaying: React.FC<NowPlayingProps> = ({
	currentSong: songId,
	isPlaying,
	className = "",
}) => {
	const dispatch = useAppDispatch();
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);
	const audioRef = useRef<HTMLAudioElement>(null);
	const progressRef = useRef<HTMLDivElement>(null);

	const currentSong = useAppSelector((state) =>
		songId ? state.song.songs[songId] : null,
	);

	const songArtist = useAppSelector((state) =>
		currentSong ? state.user.users[currentSong.artist_id] : null,
	);

	useEffect(() => {
		if (audioRef.current) {
			if (isPlaying) {
				audioRef.current.play();
			} else {
				audioRef.current.pause();
			}
		}
	}, [isPlaying]);

	const handleTogglePlay = () => {
		dispatch(togglePlayPause());
	};

	const handleProgress = (e: React.MouseEvent<HTMLDivElement>) => {
		if (progressRef.current && audioRef.current) {
			const rect = progressRef.current.getBoundingClientRect();
			const x = e.clientX - rect.left;
			const percentage = x / rect.width;
			const newTime = percentage * duration;
			audioRef.current.currentTime = newTime;
			setCurrentTime(newTime);
		}
	};

	const formatTime = (time: number) => {
		const minutes = Math.floor(time / 60);
		const seconds = Math.floor(time % 60);
		return `${minutes}:${seconds.toString().padStart(2, "0")}`;
	};

	return (
		<div className={`now-playing ${className}`}>
			<div className="now-playing-inner">
				{currentSong && songArtist ? (
					<>
						<div className="now-playing-left">
							<div className="now-playing-art">
								<img
									src={currentSong.thumb_url || "/default-album-art.png"}
									alt={currentSong.name}
								/>
							</div>
							<div className="now-playing-info">
								<Link to={`/songs/${currentSong.id}`} className="song-name">
									{currentSong.name}
								</Link>
								<Link to={`/users/${songArtist.id}`} className="artist-name">
									{songArtist.display_name}
								</Link>
							</div>
						</div>

						<div className="now-playing-center">
							<div className="playback-controls">
								<button
									type="button"
									className="control-button"
									aria-label="Previous"
								>
									⏮
								</button>
								<button
									type="button"
									className="control-button play-button"
									onClick={handleTogglePlay}
									aria-label={isPlaying ? "Pause" : "Play"}
								>
									{isPlaying ? "⏸" : "▶"}
								</button>
								<button
									type="button"
									className="control-button"
									aria-label="Next"
								>
									⏭
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
										style={{ width: `${(currentTime / duration) * 100}%` }}
									/>
								</div>
								<span className="time">{formatTime(duration)}</span>
							</div>

							<audio
								ref={audioRef}
								src={currentSong.song_url}
								onTimeUpdate={() =>
									audioRef.current &&
									setCurrentTime(audioRef.current.currentTime)
								}
								onLoadedMetadata={() =>
									audioRef.current && setDuration(audioRef.current.duration)
								}
							/>
						</div>

						<div className="now-playing-right">
							<button type="button" className="action-button" aria-label="Like">
								♡
							</button>
							<div className="volume-control">
								<button
									type="button"
									className="volume-button"
									aria-label="Volume"
								>
									🔊
								</button>
								<div className="volume-slider" />
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

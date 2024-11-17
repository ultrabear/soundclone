import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../store";
import { likeSong, unlikeSong } from "../store/slices/songsSlice";
import type { SongId } from "../store/slices/types";
import styles from "./ArtistPage/ArtistPage.module.css";
import { setCurrentSong, togglePlayPause } from "../store/playerSlice";
import { AddToPlaylist } from "./AddToPlaylist";
import { Link } from "react-router-dom";

type SongListItemProps = {
	songId: SongId;
	index: number;
	showToastMessage?: (message: string) => void;
};

export const SongListItem: React.FC<SongListItemProps> = ({
	songId,
	index,
	showToastMessage,
}) => {
	const song = useAppSelector((state) => state.song.songs[songId]);
	const artistName = useAppSelector((state) =>
		song ? state.user.users[song.artist_id]?.display_name : null,
	);
	const dispatch = useAppDispatch();
	const [isLiking, setIsLiking] = useState(false);

	const session = useAppSelector((state) => state.session.user);
	const isLiked = useAppSelector((state) => songId in state.session.likes);
	const [showAddToPlaylist, setShowAddToPlaylist] = useState(false);
	const isPlaying = useAppSelector((state) => state.player.isPlaying);
	const currentSong = useAppSelector((state) => state.player.currentSong);
	const isCurrentSong = currentSong === songId;

	const handlePlayPause = () => {
		if (isCurrentSong) {
			dispatch(togglePlayPause());
		} else {
			if (!isPlaying) {
				dispatch(togglePlayPause());
			}
			dispatch(setCurrentSong(songId));
		}
	};

	const handleLike = async () => {
		if (!session) {
			showToastMessage?.("You must be logged in to like a song.");
			return;
		}

		if (isLiking) return;

		try {
			setIsLiking(true);

			if (isLiked) {
				await dispatch(unlikeSong(songId));
				showToastMessage?.("Removed from liked songs");
			} else {
				await dispatch(likeSong(songId));
				showToastMessage?.("Added to liked songs");
			}
		} catch (error) {
			showToastMessage?.("Failed to update like status");
			console.error("Error updating like status:", error);
		} finally {
			setIsLiking(false);
		}
	};

	if (!song) {
		return <>Loading Song Details...</>;
	}

	return (
		<div className={styles.songRow}>
			<div className={styles.songNumber}>{index + 1}</div>
			<div className={styles.songTitleCell}>
				<div className={styles.songThumbnail}>
					{song.thumb_url && <img src={song.thumb_url} alt={song.name} />}
				</div>
				<Link className={styles.songName} to={`/songs/${song.id}`}>
					{song.name}
				</Link>
			</div>
			<div className={styles.songArtist}>{artistName}</div>
			<div className={styles.songGenre}>{song.genre}</div>
			<div className={styles.songActions}>
				<button
					type="button"
					className={`${styles.actionButton} ${isLiked ? styles.liked : ""}`}
					onClick={handleLike}
					disabled={isLiking}
					aria-label={isLiked ? "Unlike song" : "Like song"}
				>
					{isLiked ? "♥" : "♡"}
				</button>
				<button
					type="button"
					className={styles.actionButton}
					onClick={handlePlayPause}
					aria-label={isCurrentSong && isPlaying ? "Pause song" : "Play song"}
				>
					{isCurrentSong && isPlaying ? "⏸" : "▶"}
				</button>

				<button
					type="button"
					className={styles.actionButton}
					onClick={() => setShowAddToPlaylist(true)}
					aria-label="Add to playlist"
				>
					+
				</button>
				{showAddToPlaylist && (
					<AddToPlaylist
						song={songId}
						close={() => setShowAddToPlaylist(false)}
						showToastMessage={showToastMessage}
					/>
				)}
			</div>
		</div>
	);
};

import type React from "react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store";
import { setCurrentSong } from "../../store/playerSlice";
import { postCommentThunk } from "../../store/slices/commentsSlice";
import { slice as sessionSlice } from "../../store/slices/sessionSlice";
import {
	fetchSong,
	selectSongById,
	selectSongComments,
} from "../../store/slices/songsSlice";
import type { CommentId } from "../../store/slices/types";
import Layout from "../Layout/Layout";
import { Sidebar } from "../Layout/Layout";
import styles from "./SongDetailsPage.module.css";

function Comment({ key }: { key: CommentId }): JSX.Element {
	const comment = useAppSelector((state) => state.comment.comments[key]);

	const user = useAppSelector((state) =>
		comment ? state.user.users[comment.author_id] : null,
	);

	if (!comment) {
		return <h1>Loading comment...</h1>;
	}

	if (!user) {
		return <h1>Loading user...</h1>;
	}

	return (
		<div className={styles.comment}>
			<div className={styles.commentAvatar}>
				<img
					src={user.profile_image || "/default-profile.png"}
					alt={user.display_name}
				/>
			</div>
			<div className={styles.commentContent}>
				<div className={styles.commenterName}>{user.display_name}</div>
				<div className={styles.commentText}>{comment.text}</div>
			</div>
		</div>
	);
}

const SongDetailsPage: React.FC = () => {
	const { songId } = useParams<{ songId: string }>();
	const dispatch = useAppDispatch();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const song = useAppSelector((state) => selectSongById(state, Number(songId)));
	const comments = useAppSelector((state) =>
		selectSongComments(state, Number(songId)),
	);
	const artist = useAppSelector((state) =>
		song ? state.user.users[song.artist_id] : null,
	);

	const session = useAppSelector((state) => state.session.user);
	const user = useAppSelector(
		(state) => session && state.user.users[session.id],
	);
	const isLiked = useAppSelector((state) =>
		song ? song.id in state.session.likes : false,
	);

	const [commentText, setCommentText] = useState("");
	const [commentError, setCommentError] = useState<string | null>(null);

	useEffect(() => {
		const loadSongDetails = async () => {
			if (songId) {
				try {
					setLoading(true);

					await dispatch(fetchSong(Number(songId)));
				} catch (err) {
					setError("Failed to load song details.");
				} finally {
					setLoading(false);
				}
			} else {
				setError("Song ID not provided.");
			}
		};
		loadSongDetails();
	}, [dispatch, songId]);

	const handlePlay = () => {
		if (song) {
			dispatch(setCurrentSong(song.id));
		}
	};

	const handleCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setCommentText(e.target.value);
	};

	const handleCommentSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setCommentError(null);

		if (commentText.length < 10) {
			setCommentError("Comment must be at least 10 characters long.");
			return;
		}

		if (!user) {
			setCommentError("You must be logged in to comment.");
			return;
		}

		try {
			if (songId) {
				await dispatch(
					postCommentThunk({
						songId: Number.parseInt(songId),
						text: commentText,
					}),
				).unwrap();
				setCommentText("");
			} else {
				setCommentError("Song ID not provided.");
			}
		} catch (err) {
			setCommentError("Failed to post comment.");
		}
	};

	const handleLike = () => {
		if (!user || !song) {
			alert("You must be logged in to like a song.");
			return;
		}
		if (isLiked) {
			dispatch(sessionSlice.actions.removeLike(song.id));
		} else {
			dispatch(sessionSlice.actions.addLike(song.id));
		}
	};

	if (loading) {
		return (
			<Layout>
				<div className={styles.loading}>Loading song details...</div>
			</Layout>
		);
	}

	if (error || !song) {
		return (
			<Layout>
				<div className={styles.error}>{error || "Song not found"}</div>
			</Layout>
		);
	}

	return (
		<Layout hideSidebar>
			<div className={styles.container}>
				{/* Content wrapper for consistent width */}
				<div className={styles.contentWrapper}>
					{/* Hero section */}
					<div className={styles.hero}>
						<div className={styles.heroLeft}>
							{/* Top section with play button and info */}
							<div style={{ display: "flex", alignItems: "flex-start" }}>
								<button
									type="button"
									className={styles.playButton}
									onClick={handlePlay}
									aria-label="Play song"
								>
									▶
								</button>

								<div className={styles.songInfo}>
									<div className={styles.artistName}>
										{artist?.display_name}
									</div>
									<h1 className={styles.songTitle}>{song.name}</h1>
									<div className={styles.songMeta}>
										<div className={styles.songDate}>
											{new Date(song.created_at).toLocaleDateString()}
										</div>
										{song.genre && (
											<div className={styles.songGenre}>{song.genre}</div>
										)}
									</div>
								</div>
							</div>

							{/* Waveform at bottom */}
							<div className={styles.waveform}>Waveform Player Placeholder</div>
						</div>

						<div className={styles.heroRight}>
							<img
								src={artist?.profile_image || "/default-profile.png"}
								alt={artist?.display_name}
							/>
						</div>
					</div>

					<div className={styles.content}>
						<div className={styles.mainContent}>
							<div className={styles.commentForm}>
								<div className={styles.userAvatar}>
									<img
										src={user?.profile_image || "/default-profile.png"}
										alt="User Profile"
									/>
								</div>
								<form
									className={styles.commentInputWrapper}
									onSubmit={handleCommentSubmit}
								>
									<input
										type="text"
										placeholder="Write a comment..."
										value={commentText}
										onChange={handleCommentChange}
										className={styles.commentInput}
									/>
									<button type="submit" className={styles.submitButton}>
										Submit
									</button>
									<button
										type="button"
										className={styles.likeButton}
										onClick={handleLike}
									>
										{isLiked ? "♥" : "♡"}
									</button>
								</form>
							</div>

							{commentError && (
								<div className={styles.errorMessage}>{commentError}</div>
							)}

							<div className={styles.commentsList}>
								{Object.keys(comments).length > 0 ? (
									Object.keys(comments).map((comment) => (
										<Comment key={Number(comment)} />
									))
								) : (
									<div className={styles.noComments}>
										No comments yet. Be the first to comment!
									</div>
								)}
							</div>
						</div>

						<Sidebar />
					</div>
				</div>
			</div>
		</Layout>
	);
};

export default SongDetailsPage;

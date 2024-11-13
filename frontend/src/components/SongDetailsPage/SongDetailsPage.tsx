import type React from "react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store";
import { setCurrentSong } from "../../store/playerSlice";
import { fetchComments, postComment } from "../../store/slices/commentsSlice";
import {
	fetchLikedSongs,
	likeSong,
	unlikeSong,
} from "../../store/slices/likesSlice";
import type { CommentWithUser, SongWithUser } from "../../types";
import Layout from "../Layout/Layout";
import { api } from "../../store/api";
import styles from "./SongDetailsPage.module.css";
import { Sidebar } from "../Layout/Layout";

const SongDetailsPage: React.FC = () => {
	const { songId } = useParams<{ songId: string }>();
	const dispatch = useAppDispatch();
	const [song, setSong] = useState<SongWithUser | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const { comments } = useAppSelector((state) => state.comments);
	const { likedSongs } = useAppSelector((state) => state.likes);
	const { user } = useAppSelector((state) => state.session);

	const [commentText, setCommentText] = useState("");
	const [commentError, setCommentError] = useState<string | null>(null);

	useEffect(() => {
		const fetchSongDetails = async () => {
			try {
				if (songId) {
					const songIdNum = Number(songId);
					if (isNaN(songIdNum)) {
						setError("Invalid song ID.");
						setLoading(false);
						return;
					}

					const songData = await api.songs.getOne(songIdNum);

					const artistIdNum = Number(songData.artist_id);
					if (isNaN(artistIdNum)) {
						setError("Invalid artist ID.");
						setLoading(false);
						return;
					}

					const artistData = await api.users.getOne(artistIdNum);

					const songWithUser: SongWithUser = {
						id: songData.id,
						name: songData.name,
						artist_id: artistIdNum,
						genre: songData.genre ?? null,
						thumb_url: songData.thumb_url ?? null,
						song_ref: songData.song_ref,
						created_at: songData.created_at,
						updated_at: songData.updated_at,
						user: {
							id: artistData.id,
							username: artistData.username,
							stage_name: artistData.stage_name ?? null,
							profile_image: artistData.profile_image ?? null,
						},
					};
					setSong(songWithUser);

					dispatch(fetchComments(songIdNum));

					if (user) {
						dispatch(fetchLikedSongs());
					}
				} else {
					setError("Song ID not provided.");
				}
			} catch (err) {
				setError("Failed to load song details.");
			} finally {
				setLoading(false);
			}
		};
		fetchSongDetails();
	}, [dispatch, songId, user]);

	const handlePlay = () => {
		if (song) {
			dispatch(setCurrentSong(song));
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
				const songIdNum = Number(songId);
				await dispatch(
					postComment({ songId: songIdNum, text: commentText }),
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
		const isLiked = likedSongs.some((likedSong) => likedSong.id === song.id);
		if (isLiked) {
			dispatch(unlikeSong(song.id));
		} else {
			dispatch(likeSong(song.id));
		}
	};

	const isLiked = song
		? likedSongs.some((likedSong) => likedSong.id === song.id)
		: false;
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
									className={styles.playButton}
									onClick={handlePlay}
									aria-label="Play song"
								>
									▶
								</button>

								<div className={styles.songInfo}>
									<div className={styles.artistName}>
										{song.user.stage_name || song.user.username}
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
								src={song.user.profile_image || "/default-profile.png"}
								alt={song.user.username}
							/>
						</div>
					</div>

					<div className={styles.content}>
						<div className={styles.mainContent}>
							<div className={styles.commentForm}>
								<div className={styles.userAvatar}>
									<img
										src={(user && user.profile_image) || "/default-profile.png"}
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
								{comments.length > 0 ? (
									comments.map((comment: CommentWithUser) => (
										<div key={comment.id} className={styles.comment}>
											<div className={styles.commentAvatar}>
												<img
													src={
														comment.user.profile_image || "/default-profile.png"
													}
													alt={comment.user.username}
												/>
											</div>
											<div className={styles.commentContent}>
												<div className={styles.commenterName}>
													{comment.user.username}
												</div>
												<div className={styles.commentText}>
													{comment.comment_text}
												</div>
											</div>
										</div>
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

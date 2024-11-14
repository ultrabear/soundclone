import type React from "react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store";
import { setCurrentSong } from "../../store/playerSlice";
import { fetchComments, postComment } from "../../store/slices/commentsSlice";
import type { SongWithUser } from "../../types";
import Layout from "../Layout/Layout";
import { api } from "../../store/api";
import styles from "./SongDetailsPage.module.css";
import { Sidebar } from "../Layout/Layout";
import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "../../store";
import type { Song, SongId } from "../../store/slices/types";
import { slice as userSlice } from "../../store/slices/userSlice";
import { slice as sessionSlice } from "../../store/slices/sessionSlice";

interface DisplayComment {
	id: CommentId;
	text: string;
	created_at: string;
	updated_at: string;
	user: {
		id: UserId;
		username: string;
		stage_name: string;
		profile_image: string | null;
	};
}

// Selector for current song with user info
const selectCurrentSongWithUser = createSelector(
	[
		(state: RootState) => state.song.songs,
		(state: RootState) => state.user.users,
		(_: RootState, songId: string | undefined) => songId,
	],
	(songs, users, songId): SongWithUser | null => {
		if (!songId) return null;
		const song = songs[parseInt(songId)];
		if (!song) return null;

		const user = users[song.artist_id];
		if (!user) return null;

		return {
			...song,
			song_ref: song.song_url,
			genre: song.genre ?? null,
			thumb_url: song.thumb_url ?? null,
			created_at: song.created_at.toISOString(),
			updated_at: song.updated_at.toISOString(),
			user: {
				id: user.id,
				username: user.display_name,
				stage_name: user.display_name,
				profile_image: user.profile_image ?? null,
			},
		};
	},
);

// Updated comment selector to use store types properly
const selectSongComments = createSelector(
	[
		(state: RootState) => state.song.comments,
		(state: RootState) => state.comment.comments,
		(state: RootState) => state.user.users,
		(_: RootState, songId: string | undefined) => songId,
	],
	(songComments, comments, users, songId): DisplayComment[] => {
		if (!songId) return [];
		const songId_num = parseInt(songId);
		const commentIds = songComments[songId_num] ?? {};

		return Object.keys(commentIds)
			.map((id) => {
				const commentId = parseInt(id);
				const comment = comments[commentId];
				if (!comment) return null;

				const user = users[comment.author_id];
				if (!user) return null;

				return {
					id: comment.id,
					text: comment.text,
					created_at: comment.created_at.toISOString(),
					updated_at: comment.updated_at.toISOString(),
					user: {
						id: user.id,
						username: user.display_name,
						stage_name: user.display_name,
						profile_image: user.profile_image ?? null,
					},
				};
			})
			.filter((comment): comment is DisplayComment => comment !== null);
	},
);

const SongDetailsPage: React.FC = () => {
	const { songId } = useParams<{ songId: string }>();
	const dispatch = useAppDispatch();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const song = useAppSelector((state) =>
		selectCurrentSongWithUser(state, songId),
	);
	const comments = useAppSelector((state) => selectSongComments(state, songId));
	const { user } = useAppSelector((state) => state.session);
	const userDetails = useAppSelector((state) =>
		user ? state.user.users[user.id] : null,
	);
	const isLiked = useAppSelector((state) =>
		song ? !!state.session.likes[song.id] : false,
	);

	const [commentText, setCommentText] = useState("");
	const [commentError, setCommentError] = useState<string | null>(null);

	useEffect(() => {
		const loadSongDetails = async () => {
			if (songId) {
				try {
					setLoading(true);
					const songData = await api.songs.getOne(parseInt(songId));
					const artistData = await api.artists.getOne(songData.artist_id);

					dispatch(
						userSlice.actions.addUser({
							id: artistData.id,
							display_name: artistData.stage_name,
							profile_image: artistData.profile_image,
							first_release: artistData.first_release
								? new Date(artistData.first_release)
								: undefined,
							biography: artistData.biography,
							location: artistData.location,
							homepage_url: artistData.homepage,
						}),
					);

					dispatch(fetchComments(parseInt(songId)));
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
				await dispatch(
					postComment({ songId: parseInt(songId), text: commentText }),
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
		dispatch(sessionSlice.actions.toggleLike(song.id));
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

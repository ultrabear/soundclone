import type React from "react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store";
import { setCurrentSong, togglePlayPause } from "../../store/playerSlice";
import {
	deleteCommentThunk,
	editCommentThunk,
	postCommentThunk,
} from "../../store/slices/commentsSlice";
import {
	fetchSong,
	getLikes,
	likeSong,
	selectSongById,
	selectSongComments,
	unlikeSong,
} from "../../store/slices/songsSlice";
import type { CommentId } from "../../store/slices/types";
import Layout from "../Layout/Layout";
import { Sidebar } from "../Layout/Layout";
import styles from "./SongDetailsPage.module.css";

function CommentEditBox({
	text,
	setText,
	close,
	edit,
}: {
	text: string;
	setText: (_: string) => void;
	close: () => void;
	edit: () => void;
}) {
	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				edit();
			}}
		>
			<input
				style={{ width: "400px" }}
				type="text"
				minLength={10}
				onChange={(e) => setText(e.target.value)}
				value={text}
			/>
			<button type="submit">Edit</button>
			<button type="button" onClick={close}>
				Close
			</button>
		</form>
	);
}

function Comment({ id }: { id: CommentId }): JSX.Element {
	const comment = useAppSelector((state) => state.comment.comments[id]);

	const user = useAppSelector((state) =>
		comment ? state.user.users[comment.author_id] : null,
	);

	const me = useAppSelector(
		(state) => comment && state.session.user?.id === comment.author_id,
	);

	const dispatch = useAppDispatch();

	const [edits, setEdits] = useState("");
	const [editor, setEditor] = useState(false);

	if (!comment) {
		return <h1>Loading comment...</h1>;
	}

	if (!user) {
		return <h1>Loading user...</h1>;
	}

	const deleteComment = () => {
		dispatch(deleteCommentThunk(comment.id));
	};

	const editComment = async () => {
		await dispatch(editCommentThunk({ commentId: comment.id, text: edits }));
		setEditor(false);
	};

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
				{editor ? (
					<CommentEditBox
						text={edits}
						setText={setEdits}
						close={() => setEditor(false)}
						edit={editComment}
					/>
				) : (
					<div className={styles.commentText}>{comment.text}</div>
				)}
				{me && !editor && (
					<>
						<button
							type="button"
							onClick={(e) => {
								e.preventDefault();
								setEdits(comment.text);
								setEditor(true);
							}}
						>
							Edit
						</button>
						<button
							type="button"
							onClick={(e) => {
								e.preventDefault();
								deleteComment();
							}}
						>
							Delete
						</button>
					</>
				)}
			</div>
		</div>
	);
}

const SongDetailsPage: React.FC = () => {
	const { songId } = useParams<{ songId: string }>();
	const dispatch = useAppDispatch();
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

	const [gotLatest, setGotLatest] = useState(false);

	if (!gotLatest) {
		setGotLatest(true);

		dispatch(getLikes());
	}

	useEffect(() => {
		const loadSongDetails = async () => {
			if (songId) {
				try {
					await dispatch(fetchSong(Number(songId)));
				} catch (err) {
					setError("Failed to load song details.");
				}
			} else {
				setError("Song ID not provided.");
			}
		};
		loadSongDetails();
	}, [dispatch, songId]);

	const isPlaying = useAppSelector((state) => state.player.isPlaying);
	const currentSong = useAppSelector((state) => state.player.currentSong);

	const handlePlayPause = () => {
		if (song) {
			if (currentSong === song.id) {
				// If this is the current song, just toggle play/pause
				dispatch(togglePlayPause());
			} else {
				// If it's a different song, ensure we're in playing state first
				if (!isPlaying) {
					dispatch(togglePlayPause());
				}
				dispatch(setCurrentSong(song.id));
			}
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

		if (!session) {
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
		if (!session || !song) {
			alert("You must be logged in to like a song.");
			return;
		}
		if (isLiked) {
			dispatch(unlikeSong(song.id));
		} else {
			dispatch(likeSong(song.id));
		}
	};

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
				<div className={styles.contentWrapper}>
					<div
						className={styles.hero}
						style={
							{
								"--song-thumbnail": `url(${song.thumb_url || "/default-song-art.png"})`,
							} as React.CSSProperties
						}
					>
						<div className={styles.heroLeft}>
							<div style={{ display: "flex", alignItems: "flex-start" }}>
								<button
									type="button"
									className={styles.playButton}
									onClick={handlePlayPause}
									aria-label={
										isPlaying && currentSong === song?.id
											? "Pause song"
											: "Play song"
									}
								>
									{isPlaying && currentSong === song?.id ? "⏸" : "▶"}
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
									<div className={styles.songMeta}>
										<button
											type="button"
											className={styles.likeButton}
											onClick={handleLike}
										>
											{isLiked ? "♥" : "♡"} {song.likes}
										</button>
									</div>
								</div>
							</div>

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
							{/* Comment form section */}
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
								</form>
							</div>

							{commentError && (
								<div className={styles.errorMessage}>{commentError}</div>
							)}

							<div className={styles.commentsList}>
								{comments.length > 0 ? (
									comments.map((comment) => (
										<Comment key={comment.id} id={comment.id} />
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

import type React from "react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store";
import Layout from "../Layout/Layout";
import "./SongDetailsPage.css";
import { api } from "../../store/api";
import { setCurrentSong } from "../../store/playerSlice";
import { fetchComments, postComment } from "../../store/slices/commentsSlice";
// import {
// 	fetchLikedSongs,
// 	likeSong,
// 	unlikeSong,
// } from "../../store/slices/sessionSlice";
import type { CommentWithUser, SongWithUser } from "../../types";

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
				<div className="loading-container">Loading song details...</div>
			</Layout>
		);
	}

	if (error || !song) {
		return (
			<Layout>
				<div className="error-container">{error || "Song not found"}</div>
			</Layout>
		);
	}

	return (
		<Layout>
			{/* Hero Section */}
			<div className="song-hero-container">
				{/* Play Button */}
				<button className="hero-play-button" onClick={handlePlay}>
					▶
				</button>
				{/* Song Details */}
				<div className="song-details">
					<h1 className="song-title">{song.name}</h1>
					<div className="song-meta">
						<span className="song-artist">
							{song.user.stage_name || song.user.username}
						</span>
						<span className="meta-divider">•</span>
						<span className="song-created-at">
							{new Date(song.created_at).toLocaleDateString()}
						</span>
						{song.genre && (
							<>
								<span className="meta-divider">•</span>
								<span className="song-genre">{song.genre}</span>
							</>
						)}
					</div>
				</div>
				{/* Artist Profile Image */}
				<div className="artist-profile-image">
					<img
						src={song.user.profile_image || "/default-profile.png"}
						alt={song.user.username}
					/>
				</div>
				{/* Placeholder for Waveform */}
				<div className="waveform-placeholder">Waveform Player Placeholder</div>
			</div>

			{/* Comment Input Section */}
			<div className="comment-input-container">
				{/* User Profile Image */}
				<div className="user-profile-image">
					<img
						src={(user && user.profile_image) || "/default-profile.png"}
						alt="User Profile"
					/>
				</div>
				{/* Comment Form */}
				<form className="comment-form" onSubmit={handleCommentSubmit}>
					<input
						type="text"
						placeholder="Write a comment..."
						className="comment-input"
						value={commentText}
						onChange={handleCommentChange}
					/>
					<button type="submit" className="comment-submit-button">
						Submit
					</button>
					{/* Like Button */}
					<button type="button" className="like-button" onClick={handleLike}>
						{isLiked ? "♥" : "♡"}
					</button>
				</form>
				{commentError && <div className="error-message">{commentError}</div>}
			</div>

			{/* Comments Section */}
			<div className="comments-container">
				{comments.length > 0 ? (
					comments.map((comment: CommentWithUser) => (
						<div key={comment.id} className="comment">
							<div className="commenter-profile-image">
								<img
									src={comment.user.profile_image || "/default-profile.png"}
									alt={comment.user.username}
								/>
							</div>
							<div className="comment-content">
								<span className="commenter-name">{comment.user.username}</span>
								<p className="comment-text">{comment.comment_text}</p>
							</div>
						</div>
					))
				) : (
					<div className="no-comments">
						No comments yet. Be the first to comment!
					</div>
				)}
			</div>
		</Layout>
	);
};

export default SongDetailsPage;

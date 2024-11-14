import type React from "react";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import { setCurrentSong } from "../../store/playerSlice";
import { fetchLikedSongs } from "../../store/slices/likesSlice";
import "./LikedSongsView.css";

const LikedSongsView: React.FC = () => {
	const dispatch = useAppDispatch();
	const { likedSongs, loading, error } = useAppSelector((state) => state.likes);
	const { user } = useAppSelector((state) => state.session);

	useEffect(() => {
		if (user) {
			dispatch(fetchLikedSongs());
		}
	}, [dispatch, user]);

	const handlePlaySong = (index: number) => {
		if (likedSongs[index]) {
			dispatch(setCurrentSong(likedSongs[index]));
		}
	};

	if (loading) {
		return <div className="loading-container">Loading liked songs...</div>;
	}

	if (error) {
		return <div className="error-container">{error}</div>;
	}

	return (
		<div className="liked-songs-wrapper">
			<div className="songs-table">
				<div className="songs-header">
					<div className="song-number">#</div>
					<div className="song-title-header">Title</div>
					<div className="song-artist-header">Artist</div>
					<div className="song-genre-header">Genre</div>
					<div className="song-actions-header">Actions</div>
				</div>

				<div className="songs-list">
					{likedSongs?.map((song, index) => (
						<div key={song.id} className="song-row">
							<div className="song-number">{index + 1}</div>
							<div className="song-title-cell">
								<div className="song-thumbnail">
									{song.thumb_url && (
										<img src={song.thumb_url} alt={song.name} />
									)}
								</div>
								<span className="song-name">{song.name}</span>
							</div>
							<div className="song-artist">
								{song.user.stage_name || song.user.username}
							</div>
							<div className="song-genre">{song.genre}</div>
							<div className="song-actions">
								<button
									className="play-song-button"
									onClick={() => handlePlaySong(index)}
									aria-label="Play song"
								>
									▶
								</button>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default LikedSongsView;

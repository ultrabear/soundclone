import type React from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import { setCurrentSong } from "../../store/playerSlice";
import type { SongId } from "../../store/slices/types";
import "./LikedSongsView.css";

function SongListElement({
	key,
	index,
	playSong,
}: { key: SongId; index: number; playSong: (_: SongId) => void }) {
	const song = useAppSelector((state) => state.song.songs[key]);
	const artist = useAppSelector(
		(state) => state.user.users[song.artist_id].display_name,
	);

	return (
		<div className="song-row">
			<div className="song-number">{index + 1}</div>
			<div className="song-title-cell">
				<div className="song-thumbnail">
					{song.thumb_url && <img src={song.thumb_url} alt={song.name} />}
				</div>
				<span className="song-name">{song.name}</span>
			</div>
			<div className="song-artist">{artist}</div>
			<div className="song-genre">{song.genre}</div>
			<div className="song-actions">
				<button
					type="button"
					className="play-song-button"
					onClick={() => playSong(song.id)}
					aria-label="Play song"
				>
					▶
				</button>
			</div>
		</div>
	);
}

const LikedSongsView: React.FC = () => {
	const dispatch = useAppDispatch();
	const user = useAppSelector((state) => state.session.user);
	const likedSongs = useAppSelector((state) => state.session.likes);

	const handlePlaySong = (song: SongId) => {
		dispatch(setCurrentSong(song));
	};

	if (!user) {
		return (
			<div className="error-container">Please log in to see liked songs</div>
		);
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
					{Object.keys(likedSongs).map((song, index) => (
						<SongListElement
							key={Number(song)}
							index={index}
							playSong={handlePlaySong}
						/>
					))}
				</div>
			</div>
		</div>
	);
};

export default LikedSongsView;

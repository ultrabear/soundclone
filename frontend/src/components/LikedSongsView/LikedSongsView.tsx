import type React from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import { setCurrentSong } from "../../store/playerSlice";
import type { SongId } from "../../store/slices/types";
import type { SongWithUser } from "../../types";
import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "../../store";
import "./LikedSongsView.css";

const selectLikedSongs = createSelector(
	[
		(state: RootState) => state.session.likes,
		(state: RootState) => state.song.songs,
		(state: RootState) => state.user.users,
	],
	(likes, songs, users): SongWithUser[] => {
		return Object.keys(likes)
			.map((songId: string) => {
				const song = songs[songId as unknown as SongId];
				if (!song) return null;

				const songWithUser: SongWithUser = {
					id: song.id,
					name: song.name,
					artist_id: song.artist_id,
					genre: song.genre ?? null,
					thumb_url: song.thumb_url ?? null,
					song_ref: song.song_url,
					created_at: song.created_at.toISOString(),
					updated_at: song.updated_at.toISOString(),
					user: {
						id: song.artist_id,
						username: users[song.artist_id]?.display_name ?? "",
						stage_name: users[song.artist_id]?.display_name ?? null,
						profile_image: users[song.artist_id]?.profile_image ?? null,
					},
				};
				return songWithUser;
			})
			.filter((song): song is SongWithUser => song !== null);
	},
);

const LikedSongsView: React.FC = () => {
	const dispatch = useAppDispatch();
	const { user } = useAppSelector((state) => state.session);
	const likedSongs = useAppSelector(selectLikedSongs);

	const handlePlaySong = (song: SongWithUser) => {
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
					{likedSongs.map((song, index) => (
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
									onClick={() => handlePlaySong(song)}
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

import type React from "react";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store";
import type { SongWithUser } from "../../types";
import { fetchArtistSongs } from "../../store/slices/songsSlice";
import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "../../store";
import "./ArtistsSongsPage.css";

const selectPlaylistSongs = createSelector(
	[
		(state: RootState) => state.song.songs,
		(state: RootState) => state.user.users,
		(state: RootState) => state.playlist.currentPlaylist,
		(_: RootState, userId: string | undefined) => userId,
	],
	(songs, users, currentPlaylist, userId): SongWithUser[] => {
		if (!currentPlaylist?.songs || !userId) return [];

		return Object.values(songs)
			.filter((song) => song.artist_id === parseInt(userId))
			.map((song) => {
				const user = users[song.artist_id];
				if (!user) return null;

				const songWithUser: SongWithUser = {
					id: song.id,
					name: song.name,
					artist_id: song.artist_id,
					song_ref: song.song_url,
					genre: song.genre ?? null,
					thumb_url: song.thumb_url ?? null,
					created_at: song.created_at,
					updated_at: song.updated_at,
					user: {
						id: song.artist_id,
						username: user.display_name,
						stage_name: user.display_name,
						profile_image: user.profile_image ?? null,
					},
				};
				return songWithUser;
			})
			.filter((song): song is SongWithUser => song !== null)
			.sort(
				(a, b) =>
					new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
			);
	},
);

const ArtistsSongsPage: React.FC = () => {
	const { userId } = useParams<{ userId: string }>();
	const dispatch = useAppDispatch();

	const songs = useAppSelector((state) => selectPlaylistSongs(state, userId));

	useEffect(() => {
		if (userId) {
			dispatch(fetchArtistSongs(parseInt(userId)));
		}
	}, [dispatch, userId]);

	if (!songs.length) {
		return <div className="loading-container">Loading tracks...</div>;
	}

	return (
		<div className="artists-songs">
			{songs.map((song, index) => (
				<div key={song.id} className="track-item">
					<div className="track-main">
						<div className="track-number">{index + 1}</div>
						<div className="track-artwork">
							{song.thumb_url && <img src={song.thumb_url} alt={song.name} />}
						</div>
						<div className="track-info">
							<div className="track-title">{song.name}</div>
							<div className="track-artist">
								{song.user.stage_name || song.user.username}
							</div>
						</div>
						<div className="track-waveform">
							<div className="waveform-placeholder"></div>
						</div>
					</div>

					<div className="track-meta">
						<div className="track-date">
							{new Date(song.created_at).toLocaleDateString()}
						</div>
						<div className="track-genre">{song.genre}</div>
						<div className="track-actions">
							<button className="action-button" aria-label="Like song">
								♥
							</button>
							<button className="action-button" aria-label="Comment on song">
								💬
							</button>
							<button className="action-button" aria-label="Add to playlist">
								+
							</button>
						</div>
					</div>
				</div>
			))}
		</div>
	);
};

export default ArtistsSongsPage;

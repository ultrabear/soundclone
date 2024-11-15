import type React from "react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store";
import { setCurrentSong } from "../../store/playerSlice";
import {
	addSongToPlaylist,
	fetchPlaylist,
} from "../../store/slices/playlistsSlice";
import type { SongId } from "../../store/slices/types";
import type { SongWithUser } from "../../types";
import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "../../store";
import Layout from "../Layout/Layout";
import "./PlaylistView.css";

interface PlaylistWithUser {
	id: number;
	name: string;
	user_id: number;
	thumbnail?: string;
	songs: Record<SongId, null>;
	created_at: Date;
	updated_at: Date;
	user: {
		id: number;
		username: string;
		stage_name: string;
		profile_image: string | null;
	};
}

const selectPlaylistSongs = createSelector(
	[
		(state: RootState) => state.song.songs,
		(state: RootState) => state.user.users,
		(state: RootState) => state.playlist.currentPlaylist,
	],
	(songs, users, currentPlaylist): SongWithUser[] => {
		if (!currentPlaylist?.songs) return [];

		const transformedSongs: SongWithUser[] = [];

		for (const songId of Object.keys(currentPlaylist.songs)) {
			const song = songs[songId as unknown as SongId];
			const user = song ? users[song.artist_id] : null;

			if (song && user) {
				transformedSongs.push({
					id: song.id,
					name: song.name,
					artist_id: song.artist_id,
					song_ref: song.song_url,
					genre: song.genre ?? null,
					thumb_url: song.thumb_url ?? null,
					created_at: song.created_at,
					updated_at: song.updated_at,
					user: {
						id: user.id,
						username: user.display_name,
						stage_name: user.display_name ?? "",
						profile_image: user.profile_image ?? null,
					},
				});
			}
		}

		return transformedSongs;
	},
);

const selectCurrentPlaylistWithUser = createSelector(
	[
		(state: RootState) => state.playlist.currentPlaylist,
		(state: RootState) => state.user.users,
	],
	(playlist, users): PlaylistWithUser | null => {
		if (!playlist) return null;
		const user = users[playlist.user_id];
		if (!user) return null;

		return {
			id: playlist.id,
			name: playlist.name,
			user_id: playlist.user_id,
			thumbnail: playlist.thumbnail ?? undefined,
			songs: playlist.songs ?? {},
			created_at: playlist.created_at,
			updated_at: playlist.updated_at,
			user: {
				id: user.id,
				username: user.display_name,
				stage_name: user.display_name,
				profile_image: user.profile_image ?? null,
			},
		};
	},
);

const PlaylistView: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const dispatch = useAppDispatch();
	const [showAddToPlaylist, setShowAddToPlaylist] = useState<SongId | null>(
		null,
	);

	const playlist = useAppSelector(selectCurrentPlaylistWithUser);
	const songs = useAppSelector(selectPlaylistSongs);
	const userPlaylists = useAppSelector((state) =>
		Object.values(state.playlist.playlists),
	);

	useEffect(() => {
		if (id) {
			dispatch(fetchPlaylist(parseInt(id)));
		}
	}, [dispatch, id]);

	const handlePlaySong = (song: SongWithUser) => {
		dispatch(setCurrentSong(song));
	};

	const handleAddToPlaylist = (songId: SongId, targetPlaylistId: number) => {
		dispatch(addSongToPlaylist({ playlistId: targetPlaylistId, songId }));
		setShowAddToPlaylist(null);
	};

	if (!playlist) {
		return (
			<Layout>
				<div className="error-container">Playlist not found</div>
			</Layout>
		);
	}

	return (
		<Layout>
			<div className="playlist-view-wrapper">
				<div className="playlist-hero">
					<div className="playlist-hero-overlay" />
					<div className="playlist-hero-content">
						<div className="playlist-hero-info">
							<div className="playlist-artwork">
								{playlist.thumbnail && (
									<img src={playlist.thumbnail} alt={playlist.name} />
								)}
							</div>
							<div className="playlist-details">
								<h1 className="playlist-title">{playlist.name}</h1>
								<div className="playlist-meta">
									<span>
										Created by{" "}
										{playlist.user.stage_name || playlist.user.username}
									</span>
									<span className="meta-divider">•</span>
									<span>{songs.length} songs</span>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div className="playlist-content">
					<div className="playlist-actions">
						<button className="play-all-button">▶ Play All</button>
						<button className="share-button">Share Playlist</button>
					</div>

					<div className="songs-table">
						<div className="songs-header">
							<div className="song-number">#</div>
							<div className="song-title-header">Title</div>
							<div className="song-artist-header">Artist</div>
							<div className="song-genre-header">Genre</div>
							<div className="song-actions-header">Actions</div>
						</div>

						<div className="songs-list">
							{songs.map((song, index) => (
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
										<button
											className="add-to-playlist-button"
											onClick={() => setShowAddToPlaylist(song.id)}
											aria-label="Add to playlist"
										>
											+
										</button>
										{showAddToPlaylist === song.id && (
											<div className="playlist-dropdown">
												{userPlaylists.map((playlistItem) => (
													<button
														key={playlistItem.id}
														onClick={() =>
															handleAddToPlaylist(song.id, playlistItem.id)
														}
														className="playlist-option"
													>
														{playlistItem.name}
													</button>
												))}
											</div>
										)}
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</Layout>
	);
};

export default PlaylistView;

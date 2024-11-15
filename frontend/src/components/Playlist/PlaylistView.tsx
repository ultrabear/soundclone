import type React from "react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store";
import { setCurrentSong } from "../../store/playerSlice";
import {
	addSongToPlaylist,
	fetchPlaylist,
} from "../../store/slices/playlistsSlice";
import type { PlaylistId, SongId } from "../../store/slices/types";
import Layout from "../Layout/Layout";
import "./PlaylistView.css";

type SongListItemProps = {
	key: SongId;
	showAddToPlaylist: SongId | null;
	setShowAddToPlaylist: (_: SongId) => void;
	index: number;
	playSong: (_: SongId) => void;
	addToPlaylist: (s: SongId, p: PlaylistId) => void;
};

function SongListItem({
	key,
	index,
	setShowAddToPlaylist,
	showAddToPlaylist,
	addToPlaylist,
	playSong,
}: SongListItemProps) {
	const song = useAppSelector((state) => state.song.songs[key]);
	const artist = useAppSelector((state) => state.user.users[song.artist_id]);

	const myPlaylists = useAppSelector((state) => state.playlist.playlists);

	return (
		<div className="song-row">
			<div className="song-number">{index + 1}</div>
			<div className="song-title-cell">
				<div className="song-thumbnail">
					{song.thumb_url && <img src={song.thumb_url} alt={song.name} />}
				</div>
				<span className="song-name">{song.name}</span>
			</div>
			<div className="song-artist">{artist.display_name}</div>
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
				<button
					type="button"
					className="add-to-playlist-button"
					onClick={() => setShowAddToPlaylist(song.id)}
					aria-label="Add to playlist"
				>
					+
				</button>
				{showAddToPlaylist === song.id && (
					<div className="playlist-dropdown">
						{Object.values(myPlaylists).map((playlistItem) => (
							<button
								type="button"
								key={playlistItem.id}
								onClick={() => addToPlaylist(song.id, playlistItem.id)}
								className="playlist-option"
							>
								{playlistItem.name}
							</button>
						))}
					</div>
				)}
			</div>
		</div>
	);
}

const PlaylistView: React.FC = () => {
	const params = useParams<{ id: string }>();
	const dispatch = useAppDispatch();
	const [showAddToPlaylist, setShowAddToPlaylist] = useState<SongId | null>(
		null,
	);

	const id = Number(params.id);

	const playlist = useAppSelector((state) => state.playlist.playlists[id]);
	const playlistMaker = useAppSelector((state) =>
		playlist ? state.user.users[playlist.id] : null,
	);

	useEffect(() => {
		if (!Number.isNaN(id)) {
			dispatch(fetchPlaylist(id));
		}
	}, [dispatch, id]);

	const handlePlaySong = (song: SongId) => {
		dispatch(setCurrentSong(song));
	};

	const addToPlaylist = (songId: SongId, targetPlaylistId: number) => {
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
									<span>Created by {playlistMaker?.display_name}</span>
									<span className="meta-divider">•</span>
									<span>{Object.keys(playlist.songs).length} songs</span>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div className="playlist-content">
					<div className="playlist-actions">
						<button type="button" className="play-all-button">
							▶ Play All
						</button>
						<button type="button" className="share-button">
							Share Playlist
						</button>
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
							{Object.keys(playlist.songs).map((songId, index) => (
								<SongListItem
									key={Number(songId)}
									showAddToPlaylist={showAddToPlaylist}
									setShowAddToPlaylist={setShowAddToPlaylist}
									index={index}
									addToPlaylist={addToPlaylist}
									playSong={handlePlaySong}
								/>
							))}
						</div>
					</div>
				</div>
			</div>
		</Layout>
	);
};

export default PlaylistView;

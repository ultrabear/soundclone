import type React from "react";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store";
import { fetchPlaylist } from "../../store/slices/playlistsSlice";
import Layout from "../Layout/Layout";
import "./PlaylistView.css";
import { Link } from "react-router-dom";
import { SongListItem } from "../SongListItem";

const PlaylistView: React.FC = () => {
	const params = useParams<{ id: string }>();
	const dispatch = useAppDispatch();

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
						<Link to={`/playlist/${id}/edit`} className="edit-playlist-button">
							Edit Playlist
						</Link>
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
									songId={Number(songId)}
									index={index}
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

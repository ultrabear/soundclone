import type React from "react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store";
import { fetchUserPlaylists } from "../../store/slices/playlistsSlice";
import type { PlaylistWithUser } from "../../types";
import "./PlaylistsScreen.css";

const PlaylistsScreen: React.FC = () => {
	const dispatch = useAppDispatch();
	const { userPlaylists, loading, error } = useAppSelector(
		(state) => state.playlists,
	);

	useEffect(() => {
		dispatch(fetchUserPlaylists());
	}, [dispatch]);

	const renderPlaylist = (playlist: PlaylistWithUser) => {
		return (
			<div key={playlist.id} className="content-section">
				<div className="section-header">
					<h2 className="section-title">{playlist.name}</h2>
				</div>
				<div className="hero-section">
					<div className="hero-artwork">
						{playlist.thumbnail && (
							<img src={playlist.thumbnail} alt={playlist.name} />
						)}
						<button className="hero-play-button" aria-label="Play playlist">
							▶
						</button>
					</div>
					<div className="hero-content">
						<div className="hero-songs">
							{playlist.songs?.map((song) => (
								<div key={song.id} className="hero-song-item">
									<div className="song-info">
										<span className="song-title">{song.name}</span>
										<span className="song-divider">—</span>
										<span className="song-artist">
											{song.user.stage_name || song.user.username}
										</span>
									</div>
									<button
										className="song-play-button"
										onClick={() => {}}
										aria-label="Play song"
									>
										▶
									</button>
								</div>
							))}
						</div>
					</div>
				</div>
				<div className="hero-footer">
					<Link
						to={`/playlist/${playlist.id}`}
						className="view-playlist-button"
					>
						Go to playlist
					</Link>
				</div>
			</div>
		);
	};

	if (loading) {
		return <div className="loading-container">Loading playlists...</div>;
	}

	if (error) {
		return <div className="error-container">{error}</div>;
	}

	return (
		<div className="playlists-screen">
			{userPlaylists.map((playlist) => renderPlaylist(playlist))}
		</div>
	);
};

export default PlaylistsScreen;

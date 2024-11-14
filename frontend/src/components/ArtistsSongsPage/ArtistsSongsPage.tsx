import type React from "react";
import { useEffect } from "react"; // Add useEffect
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store";
import "./ArtistsSongsPage.css";

const ArtistsSongsPage: React.FC = () => {
	const { userId } = useParams<{ userId: string }>();
	const dispatch = useAppDispatch(); // Add dispatch
	const { currentPlaylist } = useAppSelector((state) => state.playlists);

	useEffect(() => {
		if (userId) {
			// Here we should add an action to fetch songs by artist ID
			// For example:
			// dispatch(fetchArtistSongs(Number(userId)));
		}
	}, [dispatch, userId]);

	if (!currentPlaylist?.songs) {
		return <div className="loading-container">Loading tracks...</div>;
	}

	return (
		<div className="artists-songs">
			{currentPlaylist.songs.map((song, index) => (
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
							{song.created_at &&
								new Date(song.created_at).toLocaleDateString()}
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

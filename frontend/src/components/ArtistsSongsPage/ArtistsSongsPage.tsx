import type React from "react";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store";
import {
	fetchArtistSongs,
	selectSongsByArtist,
} from "../../store/slices/songsSlice";
import "./ArtistsSongsPage.css";
import type { SongId } from "../../store/slices/types";

function SongListElement({ key, index }: { key: SongId; index: number }) {
	const song = useAppSelector((state) => state.song.songs[key]);

	const artist = useAppSelector((state) =>
		song ? state.user.users[song.artist_id]?.display_name : null,
	);

	if (!(song && artist)) {
		return <div className="track-item">Loading Song/Artist...</div>;
	}

	return (
		<div className="track-item">
			<div className="track-main">
				<div className="track-number">{index + 1}</div>
				<div className="track-artwork">
					{song.thumb_url && <img src={song.thumb_url} alt={song.name} />}
				</div>
				<div className="track-info">
					<div className="track-title">{song.name}</div>
					<div className="track-artist">{artist}</div>
				</div>
				<div className="track-waveform">
					<div className="waveform-placeholder" />
				</div>
			</div>

			<div className="track-meta">
				<div className="track-date">
					{new Date(song.created_at).toLocaleDateString()}
				</div>
				<div className="track-genre">{song.genre}</div>
				<div className="track-actions">
					<button
						type="button"
						className="action-button"
						aria-label="Like song"
					>
						♥
					</button>
					<button
						type="button"
						className="action-button"
						aria-label="Comment on song"
					>
						💬
					</button>
					<button
						type="button"
						className="action-button"
						aria-label="Add to playlist"
					>
						+
					</button>
				</div>
			</div>
		</div>
	);
}

const ArtistsSongsPage: React.FC = () => {
	const { userId } = useParams<{ userId: string }>();
	const dispatch = useAppDispatch();

	const songs = useAppSelector((state) =>
		selectSongsByArtist(state, Number(userId)),
	);

	useEffect(() => {
		if (userId) {
			dispatch(fetchArtistSongs(Number.parseInt(userId)));
		}
	}, [dispatch, userId]);

	if (!songs.length) {
		return <div className="loading-container">Loading tracks...</div>;
	}

	return (
		<div className="artists-songs">
			{songs.map((song, index) => (
				<SongListElement key={song.id} index={index} />
			))}
		</div>
	);
};

export default ArtistsSongsPage;

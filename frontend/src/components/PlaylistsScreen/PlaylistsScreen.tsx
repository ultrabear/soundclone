import type React from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store";
import { fetchUserPlaylists } from "../../store/slices/playlistsSlice";
import "./PlaylistsScreen.css";
import type { ApiError, SongId } from "../../store/api";
import type { PlaylistId } from "../../store/slices/types";

type LoadState = "no" | "pending" | "yes";

function SongInPlaylist({ key }: { key: SongId }): JSX.Element {
	const song = useAppSelector((state) => state.song.songs[key]);
	const user = useAppSelector((state) =>
		song ? state.user.users[song.artist_id] : null,
	);

	if (!song) {
		return <>Loading song...</>;
	}

	if (!user) {
		return <>Loading user...</>;
	}

	return (
		<div key={song.id} className="hero-song-item">
			<div className="song-info">
				<span className="song-title">{song.name}</span>
				<span className="song-divider">—</span>
				<span className="song-artist">{user.display_name}</span>
			</div>
			<button
				type="button"
				className="song-play-button"
				onClick={() => {}}
				aria-label="Play song"
			>
				▶
			</button>
		</div>
	);
}

function PlaylistTile({ key }: { key: PlaylistId }): JSX.Element {
	const playlist = useAppSelector((store) => store.playlist.playlists[key]);

	if (!playlist) {
		return <>Loading playlist...</>;
	}

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
					<button
						type="button"
						className="hero-play-button"
						aria-label="Play playlist"
					>
						▶
					</button>
				</div>
				<div className="hero-content">
					<div className="hero-songs">
						{Object.keys(playlist.songs).map((song) => (
							<SongInPlaylist key={Number(song)} />
						))}
					</div>
				</div>
			</div>
			<div className="hero-footer">
				<Link to={`/playlist/${playlist.id}`} className="view-playlist-button">
					Go to playlist
				</Link>
			</div>
		</div>
	);
}

const PlaylistsScreen: React.FC = () => {
	const dispatch = useAppDispatch();
	const { playlists } = useAppSelector((state) => state.playlist);

	const [loadstate, setLoadstate] = useState<LoadState>("no");
	const [errors, setErrors] = useState<ApiError | undefined>(undefined);

	if (loadstate === "no") {
		setLoadstate("pending");
		(async () => {
			try {
				await dispatch(fetchUserPlaylists());
			} catch (e) {
				if (e instanceof Error) {
					setErrors(e.api);
				}
			}
			setLoadstate("yes");
		})();
	}

	if (loadstate === "no" || loadstate === "pending") {
		return <div className="loading-container">Loading playlists...</div>;
	}

	if (errors) {
		return <div className="error-container">{errors.message}</div>;
	}

	return (
		<div className="playlists-screen">
			{Object.keys(playlists).map((playlist) => (
				<PlaylistTile key={Number(playlist)} />
			))}
		</div>
	);
};

export default PlaylistsScreen;

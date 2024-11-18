import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store";
import type { PlaylistId, SongId } from "../../store/slices/types";
import {
	setCurrentSong,
	togglePlayPause,
	clearQueue,
	addToQueue,
} from "../../store/playerSlice";

export function SongInPlaylist({
	id,
	playSong,
}: { id: SongId; playSong: (_: SongId) => void }): JSX.Element {
	const song = useAppSelector((state) => state.song.songs[id]);
	const user = useAppSelector((state) =>
		song ? state.user.users[song.artist_id] : null,
	);
	const isPlaying = useAppSelector((state) => state.player.isPlaying);
	const currentSong = useAppSelector((state) => state.player.currentSong);
	const isCurrentSong = currentSong === id;

	const handlePlay = (e: React.MouseEvent) => {
		e.preventDefault();
		playSong(id);
	};

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
				onClick={handlePlay}
				aria-label={isCurrentSong && isPlaying ? "Pause" : "Play"}
			>
				{isCurrentSong && isPlaying ? "⏸" : "▶"}
			</button>
		</div>
	);
}

export function PlaylistTile({
	id,
	topSongs,
}: {
	id: PlaylistId | "likes";
	topSongs: { id: SongId }[];
}): JSX.Element {
	const dispatch = useAppDispatch();
	let playlist:
		| undefined
		| {
				id?: number;
				name: string;
				thumbnail?: string;
				songs: Record<SongId, null>;
		  };

	const hasId = useAppSelector((store) =>
		typeof id === "number" ? store.playlist.playlists[id] : undefined,
	);

	const likes = useAppSelector((state) => state.session.likes);
	const isPlaying = useAppSelector((state) => state.player.isPlaying);
	const currentSong = useAppSelector((state) => state.player.currentSong);

	if (typeof id === "number") {
		playlist = hasId;
	} else {
		playlist = { name: "Liked Songs", songs: likes };
	}

	if (!playlist) {
		return <>Loading playlist...</>;
	}

	const handlePlaySong = (songId: SongId) => {
		const songIndex = topSongs.findIndex((song) => song.id === songId);
		if (songIndex !== -1) {
			if (currentSong === songId) {
				dispatch(togglePlayPause());
			} else {
				if (!isPlaying) {
					dispatch(togglePlayPause());
				}
				dispatch(setCurrentSong(songId));
				dispatch(clearQueue());

				topSongs.slice(songIndex + 1).forEach((song) => {
					dispatch(addToQueue(song.id));
				});
			}
		}
	};

	return (
		<div className="content-section">
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
						onClick={() =>
							handlePlaySong(Number(Object.keys(playlist.songs)[0]))
						}
						aria-label={
							isPlaying &&
							currentSong === Number(Object.keys(playlist.songs)[0])
								? "Pause"
								: "Play"
						}
					>
						{isPlaying && currentSong === Number(Object.keys(playlist.songs)[0])
							? "⏸"
							: "▶"}
					</button>
				</div>
				<div className="hero-content">
					<div className="hero-songs">
						{Object.keys(playlist.songs).map((song) => (
							<SongInPlaylist
								key={Number(song)}
								id={Number(song)}
								playSong={handlePlaySong}
							/>
						))}
					</div>
				</div>
			</div>
			{playlist.id && (
				<div className="hero-footer">
					<Link
						to={`/playlist/${playlist.id}`}
						className="view-playlist-button"
					>
						Go to playlist
					</Link>
					<Link
						to={`/playlist/${playlist.id}/edit`}
						className="edit-playlist-button"
					>
						Edit playlist
					</Link>
				</div>
			)}
		</div>
	);
}

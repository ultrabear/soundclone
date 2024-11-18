import { Link } from "react-router-dom";
import { useAppSelector } from "../../store";
import type { PlaylistId, SongId } from "../../store/slices/types";

const MY_PLAYLIST_IMAGE =
	"https://soundclone-image-files.s3.us-east-1.amazonaws.com/my_playlists_image.png";
const MY_LIKES_IMAGE =
	"https://soundclone-image-files.s3.us-east-1.amazonaws.com/my_likes_long.png";

export function SongInPlaylist({ id }: { id: SongId }): JSX.Element {
	const song = useAppSelector((state) => state.song.songs[id]);
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

export function PlaylistTile({
	id,
}: {
	id: PlaylistId | "likes";
}): JSX.Element {
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

	if (typeof id === "number") {
		playlist = hasId;
	} else {
		playlist = { name: "Liked Songs", songs: likes };
	}

	if (!playlist) {
		return <>Loading playlist...</>;
	}

	return (
		<div className="content-section">
			<div className="section-header">
				<h2 className="section-title">{playlist.name}</h2>
			</div>
			<img
				className="user-view-section-image"
				src={playlist.id ? MY_PLAYLIST_IMAGE : MY_LIKES_IMAGE}
				alt=""
			/>
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
							<SongInPlaylist key={Number(song)} id={Number(song)} />
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

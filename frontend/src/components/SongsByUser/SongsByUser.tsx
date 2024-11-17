import type React from "react";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import {
	fetchArtistSongs,
	selectSongsByArtist,
} from "../../store/slices/songsSlice";
import type { SongId } from "../../store/slices/types";
import { useNavigate } from "react-router-dom";
import OpenModalButton from "../OpenModalButton/OpenModalButton";
import DeleteSongModal from "../DeleteSongModal/DeleteSongModal";
import EditSongFormModal from "../EditSongFormModal/EditSongFormModal";

type LoadingState = "no" | "loading" | "response" | "finished";

function UploadedSong({ songId }: { songId: SongId }) {
	const song = useAppSelector((state) => state.song.songs[songId]);

	if (!song) {
		return <div className="track-item">Loading Song...</div>;
	}

	return (
		<div className="track-item">
			<div className="track-main">
				<div className="track-artwork">
					{song.thumb_url && <img src={song.thumb_url} alt={song.name} />}
				</div>
				<div className="track-info">
					<div className="track-title">{song.name}</div>
				</div>
			</div>

			<div className="track-meta">
				<div className="track-date">
					{new Date(song.created_at).toLocaleDateString()}
				</div>
				<div className="track-genre">{song.genre}</div>
				<div className="track-actions">
					<OpenModalButton
						modalComponent={<EditSongFormModal songId={song.id} />}
						buttonText="Edit Song"
						classes="action-button"
					/>
					<OpenModalButton
						modalComponent={<DeleteSongModal songId={song.id} />}
						buttonText="Delete Song"
						classes="action-button"
					/>
				</div>
			</div>
		</div>
	);
}

const SongsByUser: React.FC = () => {
	const sessionUser = useAppSelector((state) => state.session.user);
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const [loading, setLoading] = useState<LoadingState>("no");
	const songs = useAppSelector((state) =>
		sessionUser ? selectSongsByArtist(state, sessionUser.id) : null,
	);

	if (!sessionUser) {
		navigate("/");
		return <></>; // UserView component requires an element to be returned here
	}

	if (!songs) {
		return <div className="track-item">Loading Your Songs...</div>;
	}

	if (loading === "no") {
		setLoading("loading");
		dispatch(fetchArtistSongs(sessionUser.id)).then(() =>
			setLoading("response"),
		);
	} else if (loading === "response") {
		setLoading("finished");
	}

	return (
		<div className="artists-songs">
			{songs.map((song) => (
				<UploadedSong key={song.id} songId={song.id} />
			))}
		</div>
	);
};

export default SongsByUser;

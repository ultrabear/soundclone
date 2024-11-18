import type React from "react";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import {
	fetchArtistSongs,
	selectSongsByArtist,
} from "../../store/slices/songsSlice";
import type { SongId } from "../../store/slices/types";
import { Link, useNavigate } from "react-router-dom";
import OpenModalButton from "../OpenModalButton/OpenModalButton";
import DeleteSongModal from "../DeleteSongModal/DeleteSongModal";
import EditSongFormModal from "../EditSongFormModal/EditSongFormModal";
import "./SongsByUser.css";

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
						buttonText="Edit"
						classes="action-button edit-song-button"
					/>
					<OpenModalButton
						modalComponent={<DeleteSongModal songId={song.id} />}
						buttonText="Remove"
						classes="action-button delete-song-button"
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
		<section className="uploads-section flex-col">
			<img
				className="user-view-section-image"
				src="https://soundclone-image-files.s3.us-east-1.amazonaws.com/f81c659b703b46d486eebcadd968685d.png"
				alt=""
			/>
			<div className="hero-section user-uploads">
				{songs.length === 0 ? (
					<div className="no-uploads-yet flex-col">
						<h2>You have not uploaded any songs yet!</h2>
						<Link
							to="/new-song"
							className="no-uploads-button header-button button-primary"
						>
							Upload First Song
						</Link>
					</div>
				) : (
					songs.map((song) => <UploadedSong key={song.id} songId={song.id} />)
				)}
			</div>
		</section>
	);
};

export default SongsByUser;

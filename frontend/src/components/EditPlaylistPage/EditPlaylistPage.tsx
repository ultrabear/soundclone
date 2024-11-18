import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store";
import { api } from "../../store/api";
import { fetchPlaylist } from "../../store/slices/playlistsSlice";
import type { SongId } from "../../store/slices/types";
import Layout from "../Layout/Layout";
import "./EditPlaylistPage.css";

interface EditPlaylistFormData {
	name: string;
	thumbnail?: File;
}

const EditPlaylistPage = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const dispatch = useAppDispatch();
	const [formData, setFormData] = useState<EditPlaylistFormData>({ name: "" });
	const [errors, setErrors] = useState<Record<string, string | string[]>>({});
	const session = useAppSelector((state) => state.session.user?.id);

	const playlist = useAppSelector((state) =>
		id ? state.playlist.playlists[Number.parseInt(id)] : null,
	);

	const songs = useAppSelector((state) =>
		playlist
			? Object.keys(playlist.songs).map(
					(songId) => state.song.songs[Number.parseInt(songId)],
				)
			: [],
	);

	useEffect(() => {
		if (id) {
			dispatch(fetchPlaylist(Number.parseInt(id)));
		}
	}, [dispatch, id]);

	useEffect(() => {
		if (playlist) {
			setFormData({
				name: playlist.name,
			});
		}
	}, [playlist]);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setErrors({});

		const formDataUpload = new FormData();

		if (formData.name) formDataUpload.append("name", formData.name);
		if (formData.thumbnail)
			formDataUpload.append("thumbnail_img", formData.thumbnail);

		try {
			if (id) {
				await api.playlists.update(Number.parseInt(id), formDataUpload);
				dispatch(fetchPlaylist(Number.parseInt(id)));
				navigate(`/playlist/${id}`);
			} else {
				const response = await api.playlists.create(formDataUpload);
				navigate(`/playlist/${response.id}`);
			}
		} catch (err) {
			if (err instanceof Error && err.flaskError) {
				setErrors(err.flaskError);
			}
		}
	};

	const handleRemoveSong = async (songId: SongId) => {
		if (id) {
			try {
				await api.playlists.removeSong(Number.parseInt(id), songId);
				dispatch(fetchPlaylist(Number.parseInt(id)));
			} catch (err) {
				if (err instanceof Error && err.api) {
					setErrors(err.api.errors);
				}
			}
		}
	};

	if (session === undefined) {
		navigate("/");
	}

	return (
		<Layout>
			<div className="edit-playlist-container">
				<h1>{id ? "Edit Playlist" : "Create New Playlist"}</h1>

				<form onSubmit={handleSubmit} className="edit-playlist-form">
					<div className="form-group">
						<label htmlFor="name">Playlist Name</label>
						<input
							type="text"
							id="name"
							name="name"
							value={formData.name}
							onChange={handleInputChange}
							className={errors.name ? "error" : ""}
						/>
						{errors.name && (
							<span className="error-message">{errors.name}</span>
						)}
					</div>

					<div className="form-group">
						<button className="choose-file-button" type="button">
							<label className="label-on-button" htmlFor="playlist-image-file">
								{formData.thumbnail
									? formData.thumbnail.name
									: playlist?.thumbnail
										? "Edit Playlist Image"
										: "Add Playlist Image"}
							</label>
						</button>
						<input
							hidden
							id="playlist-image-file"
							type="file"
							accept="image/png, image/jpeg, image/webp, image/jpg"
							onChange={(e) => {
								if (e.target.files?.length)
									setFormData({
										name: formData.name,
										thumbnail: e.target.files[0]!,
									});
							}}
						/>

						{errors.thumbnail && (
							<span className="error-message">{errors.thumbnail}</span>
						)}
					</div>

					<button type="submit" className="save-button">
						{id ? "Save Changes" : "Create Playlist"}
					</button>
				</form>

				{id && songs.length > 0 && (
					<div className="playlist-songs">
						<h2>Songs in Playlist</h2>
						<div className="songs-list">
							{songs.map(
								(song) =>
									song && (
										<div key={song.id} className="song-item">
											<div className="song-info">
												<img
													src={song.thumb_url}
													alt={song.name}
													className="song-thumbnail"
												/>
												<span className="song-name">{song.name}</span>
											</div>
											<button
												type="button"
												onClick={() => handleRemoveSong(song.id)}
												className="remove-song-button"
											>
												Remove
											</button>
										</div>
									),
							)}
						</div>
					</div>
				)}
			</div>
		</Layout>
	);
};

export default EditPlaylistPage;

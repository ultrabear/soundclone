import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store";
import { createSongThunk } from "../../store/slices/songsSlice";
import Layout from "../Layout/Layout";
import "./SongUploadForm.css";
import { ApiError } from "../../store/api";

const SongUploadForm = (): JSX.Element => {
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const sessionUser = useAppSelector((state) => state.session.user);
	const [name, setName] = useState<string>("");
	const [genre, setGenre] = useState<string>("");
	const [thumbUrl, setThumbUrl] = useState<File | null>(null);
	const [songFile, setSongFile] = useState<File | null>(null);
	const [uploading, setUploading] = useState<boolean>(false);
	const [errors, setErrors] = useState(
		{} as {
			server?: ApiError;
		},
	);

	if (!sessionUser) {
		navigate("/");
		return <></>;
	}

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setUploading(true);
		setErrors({});

		const formData = new FormData();

		formData.append("name", name);
		formData.append("genre", genre);
		if (thumbUrl) formData.append("thumbnail_img", thumbUrl);
		if (songFile) formData.append("song_file", songFile);

		const response = await dispatch(createSongThunk(formData)).unwrap();

		if (typeof response !== "number" && response?.errors) {
			setErrors(response.errors);
		} else {
			const newSongId = response;
			navigate(`/songs/${newSongId}`);
		}
	};

	return (
		<Layout>
			<h1>Track info</h1>
			{errors.server && <p>{errors.server.message}</p>}
			<form
				className="upload-song-form  flex-col"
				encType="multipart/form-data"
				onSubmit={handleSubmit}
			>
				<div className="upload-form-field flex-col">
					<label className="upload-form-text-label" htmlFor="title">
						Track title<span className="required-star">*</span>
					</label>
					<input
						className="upload-form-text-input"
						id="title"
						type="text"
						value={name}
						onChange={(e) => setName(e.target.value)}
						required
					/>
				</div>
				<div className="upload-form-field flex-col">
					<label className="upload-form-text-label" htmlFor="genre">
						Genre
					</label>
					<input
						className="upload-form-text-input"
						id="genre"
						type="text"
						value={genre}
						onChange={(e) => setGenre(e.target.value)}
					/>
				</div>
				<div className="upload-form-field flex-col">
					<button className="choose-file-button" type="button">
						<label className="label-on-button" htmlFor="song-thumbnail">
							{thumbUrl ? thumbUrl.name : "Add Track Artwork"}
						</label>
					</button>
					<input
						hidden
						id="song-thumbnail"
						type="file"
						accept="image/png, image/jpeg, image/webp, image/jpg"
						onChange={(e) => {
							if (e.target.files?.length) setThumbUrl(e.target.files[0]!);
						}}
					/>
				</div>
				<div className="upload-form-field flex-col">
					<button className="choose-file-button" type="button">
						<label className="label-on-button" htmlFor="song-file">
							{songFile ? songFile.name : "Choose Song File"}
							{!songFile && <span className="required-star">*</span>}
						</label>
					</button>
					<input
						hidden
						id="song-file"
						type="file"
						accept="audio/mp3, audio/mpeg, audio/aac, audio/mp4, audio/x-m4a, audio/opus, audio/wav, audio/flac, audio/ogg"
						onChange={(e) => {
							if (e.target.files?.length) setSongFile(e.target.files[0]!);
						}}
						required
					/>
				</div>

				<button className="song-upload-button" type="submit">
					Upload
				</button>
				{uploading && <p>Uploading...</p>}
			</form>
		</Layout>
	);
};

export default SongUploadForm;

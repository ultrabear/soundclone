import { useState } from "react";
import { useModal } from "../../context/useModal";
import { useAppDispatch, useAppSelector } from "../../store";
import { fetchSong, updateSongThunk } from "../../store/slices/songsSlice";
import { ApiError, type SongId } from "../../store/api";

type LoadingState = "no" | "loading" | "response" | "finished";

interface SongProps {
	songId: SongId;
}

const EditSongModal = (Props: SongProps): JSX.Element => {
	const { songId } = Props;
	const song = useAppSelector((state) => state.song.songs[songId]);
	const dispatch = useAppDispatch();
	const { closeModal } = useModal();
	const [loading, setLoading] = useState<LoadingState>("no");
	const [name, setName] = useState<string>("");
	const [genre, setGenre] = useState<string>("");
	const [existingThumbnail, setExistingThumbnail] = useState<string | null>(
		null,
	);
	const [thumbUrl, setThumbUrl] = useState<File | null>(null);
	const [updating, setUpdating] = useState<boolean>(false);
	const [errors, setErrors] = useState(
		{} as {
			server?: ApiError;
		},
	);

	if (loading === "no") {
		setLoading("loading");
		dispatch(fetchSong(songId)).then(() => {
			setLoading("response");
			if (song) {
				setName(song.name);
				if (song.genre) setGenre(song.genre);
				if (song.thumb_url) setExistingThumbnail(song.thumb_url);
			}
		});
	} else if (loading === "response") {
		setLoading("finished");
	}

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		setErrors({});

		const formData = new FormData();

		formData.append("name", name);
		formData.append("genre", genre);
		if (thumbUrl) formData.append("thumbnail_img", thumbUrl);

		setUpdating(true);

		const response = await dispatch(
			updateSongThunk({ songId, songData: formData }),
		).unwrap();

		if (response?.errors) {
			setErrors(response.errors);
		} else {
			closeModal();
		}
	};

	return (
		<>
			<h1>Edit Track nfo</h1>
			{errors.server && <p>{errors.server.message}</p>}
			{existingThumbnail && (
				<img
					style={{ height: "220px", width: "220px" }}
					src={existingThumbnail}
					alt="your already existing thumbnail image"
				/>
			)}
			<form
				className="upload-song-form  flex-col"
				encType="multipart/form-data"
				onSubmit={handleSubmit}
			>
				<div className="upload-form-field flex-col">
					<button className="choose-file-button" type="button">
						<label className="label-on-button" htmlFor="song-thumbnail">
							{thumbUrl ? thumbUrl.name : "Update Image"}
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

				<button className="song-upload-button" type="submit">
					Update
				</button>
				{updating && <p>Updating...</p>}
			</form>
		</>
	);
};

export default EditSongModal;

import { useState } from "react";
// import { Navigate, useNavigate } from "react-router-dom";
import { Navigate } from "react-router-dom";
import { createSongThunk } from "../../store/slices/songsSlice";
import { useAppDispatch, useAppSelector } from "../../store";
const ALLOWED_SOUND_EXTENSIONS = new Set([
	"mp3",
	"aac",
	"m4a",
	"opus",
	"wav",
	"flac",
	"ogg",
]);
const ALLOWED_IMAGE_EXTENSIONS = new Set(["png", "jpg", "jpeg", "webp"]);

const SongUploadForm: () => JSX.Element = () => {
	const dispatch = useAppDispatch();
	// const navigate = useNavigate();
	const sessionUser = useAppSelector((state) => state.session.user);
	const [name, setName] = useState<string>("");
	const [genre, setGenre] = useState<string>("");
	const [thumbUrl, setThumbUrl] = useState<File | null>(null);
	const [songFile, setSongFile] = useState<File | null>(null);
	const [uploading, setUploading] = useState<boolean>(false);
	const [errors, setErrors] = useState(
		{} as {
			server?: string;
			thumbUrl?: string;
			songFile?: string;
		},
	);

	if (!sessionUser) return <Navigate to="/" replace={true} />;

	interface clientSideErrors {
		thumbUrl?: string;
		songFile?: string;
	}

	const clientSideValidations = (): clientSideErrors => {
		const errors: clientSideErrors = {};
		const unallowedFile = "Unallowed file extension";

		// check file extensions
		const songExt = songFile?.name.split(".").pop()?.toLowerCase();
		if (songExt && !ALLOWED_SOUND_EXTENSIONS.has(songExt)) {
			errors.songFile = unallowedFile;
		}

		const imageExt = thumbUrl?.name.split(".").pop()?.toLowerCase();
		if (imageExt && !ALLOWED_IMAGE_EXTENSIONS.has(imageExt)) {
			errors.thumbUrl = unallowedFile;
		}

		return errors;
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const userErrors = clientSideValidations();
		if (Object.keys(userErrors).length > 0) {
			return setErrors(userErrors);
		}

		setErrors({});

		const formData = new FormData();

		if (thumbUrl && songFile) {
			formData.append("name", name);
			formData.append("genre", genre);
			formData.append("thumbnail_img", thumbUrl);
			formData.append("song_file", songFile);
			setUploading(true);
			const serverResponse = await dispatch(createSongThunk(formData));

			console.log(serverResponse);
		}
	};

	return (
		<>
			<h1>Upload a Song</h1>
			{errors.server && <p>{errors.server}</p>}
			<form encType="multipart/form-data" onSubmit={handleSubmit}>
				<label>
					Name of Song
					<input
						type="text"
						value={name}
						onChange={(e) => setName(e.target.value)}
						required
					/>
				</label>
				<label>
					Genre (opt.)
					<input
						type="text"
						value={genre}
						onChange={(e) => setGenre(e.target.value)}
					/>
				</label>
				<label>
					Song Thumbnail Image (opt.)
					<input
						type="file"
						accept="image/png, image/jpeg, image/webp, image/jpg"
						onChange={(e) => {
							if (e.target.files) setThumbUrl(e.target.files[0]);
						}}
					/>
				</label>
				{errors.thumbUrl && <p>{errors.thumbUrl}</p>}
				<label>
					Song File
					<input
						type="file"
						accept="audio/mp3, audio/aac, audio/m4a, audio/opus, audio/wav, audio/flac, audio/ogg"
						onChange={(e) => {
							if (e.target.files) setSongFile(e.target.files[0]);
						}}
						required
					/>
				</label>
				{errors.songFile && <p>{errors.songFile}</p>}
				<button type="submit">Upload Song</button>
				{uploading && <p>Uploading...</p>}
			</form>
		</>
	);
};

export default SongUploadForm;

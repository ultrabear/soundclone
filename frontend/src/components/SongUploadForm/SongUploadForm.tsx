import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { thunkCreateSong } from "../../store/session";
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
  const navigate = useNavigate();
  const sessionUser = useAppSelector((state) => state.session.user);
  const [name, setName] = useState("");
  const [genre, setGenre] = useState("");
  const [thumbUrl, setThumbUrl] = useState("");
  const [songFile, setSongFile] = useState(null);
  const [errors, setErrors] = useState(
    {} as {
      server?: string;
      name?: string;
      genre?: string;
      thumbUrl?: string;
      songFile?: string;
    }
  );

  if (!sessionUser) return <Navigate to="/" replace={true} />;

  interface clientSideErrors {
    name?: string;
    thumbUrl?: string;
    songFile?: string;
  }

  const clientSideValidations = (): clientSideErrors => {
    const errors: clientSideErrors = {};

    if (name.length < 1) {
      errors.name = "Song must have a name";
    }

    if (!songFile) {
      errors.songFile = "You must upload a file";
    }

    // if song file has an extension that's not allowed, provide the necessary error
    // if thumbUrl has an extension that's not allowed provide the necessary error

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const userErrors = clientSideValidations();
    if (Object.keys(userErrors).length > 0) {
      return setErrors(userErrors);
    }

    setErrors({});

    const serverResponse = await dispatch(
      thunkCreateSong({
        name,
        genre,
        thumbUrl,
        songFile,
      })
    );

    if (serverResponse) {
      setErrors(serverResponse);
    } else {
      navigate("/");
    }
  };

  return (
    <>
      <h1>Upload a Song</h1>
      {errors.server && <p>{errors.server}</p>}
      <form onSubmit={handleSubmit}>
        <label>
          Name of Song
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>
        {errors.name && <p>{errors.name}</p>}
        <label>
          Genre (opt.)
          <input
            type="text"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
          />
        </label>
        <label>
          Song Thumbnail Image
          <input
            type="file"
            id="thumb-url"
            name="thumb_url"
            accept="image/png, image/jpeg, image/webp, image/jpg"
            onChange={(e) => {
              e.target.files && setThumbUrl(e.target.files[0]);
            }}
          />
        </label>
        {errors.thumbUrl && <p>{errors.thumbUrl}</p>}
        <label>
          Song File
          <input
            type="file"
            id="song-file"
            name="song_file"
            accept="audio/mp3, audio/aac, audio/m4a, audio/opus, audio/wav, audio/flac, audio/ogg"
            onChange={(e) => {
              e.target.files && setSongFile(e.target.files[0]);
            }}
            required
          />
        </label>
        {errors.songFile && <p>{errors.songFile}</p>}
        <button type="submit">Sign Up</button>
      </form>
    </>
  );
};

export default SongUploadForm;

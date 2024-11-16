import type React from "react";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import {
  fetchArtistSongs,
  selectSongsByArtist,
} from "../../store/slices/songsSlice";
import type { SongId } from "../../store/slices/types";
import { useNavigate } from "react-router-dom";
// TODO Import any needed CSS and move ArtistSongsPage CSS to central location for use with classes here

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
          <button
            type="button"
            className="action-button"
            aria-label="Edit song"
          >
            Edit Song
          </button>
          <button
            type="button"
            className="action-button"
            aria-label="Delete song"
          >
            Delete Song
          </button>
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

  if (!sessionUser) {
    navigate("/");
    return <></>; // UserView component requires an element to be returned here
  }
  const songs = useAppSelector((state) =>
    selectSongsByArtist(state, sessionUser.id)
  );

  if (!songs) {
    return <div className="track-item">Loading Your Songs...</div>;
  }

  if (loading === "no") {
    setLoading("loading");
    dispatch(fetchArtistSongs(sessionUser.id)).then(() =>
      setLoading("response")
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

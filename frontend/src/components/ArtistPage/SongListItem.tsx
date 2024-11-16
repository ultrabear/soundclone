import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import { likeSong, unlikeSong } from "../../store/slices/songsSlice";
import type { Song, SongId } from "../../store/slices/types";
import styles from "./ArtistPage.module.css";

type SongListItemProps = {
    song: Song;
    index: number;
    artistName: string;
    onPlay: (songId: SongId) => void;
    onAddToPlaylist: (songId: SongId) => void;
    showToastMessage: (message: string) => void;
    userPlaylists?: Array<{ id: number; name: string }>;
    isCreatingPlaylist?: boolean;
    newPlaylistName?: string;
    onCreateNewPlaylist?: (songId: number) => void;
    onNewPlaylistNameChange?: (value: string) => void;
    onStartCreatePlaylist?: () => void;
    handleAddToPlaylist?: (playlistId: number, songId: number, playlistName: string) => void;
    showAddToPlaylist: number | null;
};

export const SongListItem: React.FC<SongListItemProps> = ({
    song,
    index,
    artistName,
    onPlay,
    onAddToPlaylist,
    showToastMessage,
    userPlaylists,
    isCreatingPlaylist,
    newPlaylistName,
    onCreateNewPlaylist,
    onNewPlaylistNameChange,
    onStartCreatePlaylist,
    handleAddToPlaylist,
    showAddToPlaylist
}) => {
    const dispatch = useAppDispatch();
    const [isLiking, setIsLiking] = useState(false);
    
    const session = useAppSelector((state) => state.session.user);
    const isLiked = useAppSelector((state) => song.id in state.session.likes);

    const handleLike = async () => {
        if (!session) {
            showToastMessage("You must be logged in to like a song.");
            return;
        }

        if (isLiking) return;

        try {
            setIsLiking(true);
            
            if (isLiked) {
                await dispatch(unlikeSong(song.id));
                showToastMessage("Removed from liked songs");
            } else {
                await dispatch(likeSong(song.id));
                showToastMessage("Added to liked songs");
            }
        } catch (error) {
            showToastMessage("Failed to update like status");
            console.error("Error updating like status:", error);
        } finally {
            setIsLiking(false);
        }
    };

    return (
        <div className={styles.songRow}>
            <div className={styles.songNumber}>{index + 1}</div>
            <div className={styles.songTitleCell}>
                <div className={styles.songThumbnail}>
                    {song.thumb_url && (
                        <img src={song.thumb_url} alt={song.name} />
                    )}
                </div>
                <span className={styles.songName}>{song.name}</span>
            </div>
            <div className={styles.songArtist}>{artistName}</div>
            <div className={styles.songGenre}>{song.genre}</div>
            <div className={styles.songActions}>
                <button
                    type="button"
                    className={`${styles.actionButton} ${isLiked ? styles.liked : ''}`}
                    onClick={handleLike}
                    disabled={isLiking}
                    aria-label={isLiked ? "Unlike song" : "Like song"}
                >
                    {isLiked ? "♥" : "♡"}
                </button>
                <button
                    type="button"
                    className={styles.actionButton}
                    onClick={() => onPlay(song.id)}
                    aria-label="Play song"
                >
                    ▶
                </button>
                <button
                    type="button"
                    className={styles.actionButton}
                    onClick={() => onAddToPlaylist(song.id)}
                    aria-label="Add to playlist"
                >
                    +
                </button>
                {showAddToPlaylist === song.id && userPlaylists && (
                    <div className={styles.playlistDropdown}>
                        {userPlaylists.map((playlist) => (
                            <button
                                type="button"
                                key={playlist.id}
                                className={styles.playlistOption}
                                onClick={() => handleAddToPlaylist?.(playlist.id, song.id, playlist.name)}
                            >
                                {playlist.name}
                            </button>
                        ))}
                        {isCreatingPlaylist ? (
                            <div className={styles.playlistOption}>
                                <input
                                    type="text"
                                    value={newPlaylistName}
                                    onChange={(e) => onNewPlaylistNameChange?.(e.target.value)}
                                    placeholder="Enter playlist name"
                                    autoFocus
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter' && onCreateNewPlaylist) {
                                            onCreateNewPlaylist(song.id);
                                        }
                                    }}
                                />
                            </div>
                        ) : (
                            <button
                                type="button"
                                className={`${styles.playlistOption} ${styles.createNewPlaylist}`}
                                onClick={onStartCreatePlaylist}
                            >
                                Create New Playlist
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
import type React from "react";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store";
import { setCurrentSong } from "../../store/playerSlice";
import {
    fetchSong,
    getLikes,
    selectSongsByArtist,
    addSongs,
} from "../../store/slices/songsSlice";
import type { PlaylistId, SongId } from "../../store/slices/types";
import { getUserDetails } from "../../store/slices/userSlice";
import { api } from "../../store/api";
import Layout from "../Layout/Layout";
import { SongListItem } from "./SongListItem";
import styles from "./ArtistPage.module.css";

const ArtistPage: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [showAddToPlaylist, setShowAddToPlaylist] = useState<PlaylistId | null>(null);
    const [loading, setLoading] = useState(true);
    const [newPlaylistName, setNewPlaylistName] = useState<string>("");
    const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");

    // Selectors
    const artist = useAppSelector((state) =>
        userId ? state.user.users[Number.parseInt(userId)] : null
    );
    const songs = useAppSelector((state) =>
        selectSongsByArtist(state, Number(userId))
    );
    const userPlaylists = useAppSelector((state) =>
        Object.values(state.playlist.playlists)
    );

    const showToastMessage = (message: string) => {
        setToastMessage(message);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
    };

    useEffect(() => {
        const loadArtist = async () => {
            if (userId) {
                try {
                    setLoading(true);
                    await dispatch(getUserDetails(Number.parseInt(userId)));
                    const response = await fetch(`/api/songs?artist_id=${userId}`);
                    const songsData = await response.json();
                    dispatch(addSongs(songsData.songs));
                    await dispatch(getLikes()); // Ensure likes are loaded
                } catch (error) {
                    console.error("Error loading artist:", error);
                    showToastMessage("Failed to load artist data");
                } finally {
                    setLoading(false);
                }
            }
        };

        loadArtist();
    }, [dispatch, userId]);

    const handlePlaySong = (songId: SongId) => {
        dispatch(setCurrentSong(songId));
    };

    const handleAddToPlaylist = async (playlistId: number, songId: number, playlistName: string) => {
        try {
            await api.playlists.addSong(playlistId, songId);
            setShowAddToPlaylist(null);
            showToastMessage(`Added song to ${playlistName}`);
        } catch (error) {
            console.error('Error adding song to playlist:', error);
            showToastMessage('Failed to add song to playlist');
        }
    };

    const handleCreateNewPlaylist = async (songId: number) => {
        if (!newPlaylistName.trim()) return;
        
        try {
            const response = await api.playlists.create({
                name: newPlaylistName
            });
            
            await api.playlists.addSong(response.id, songId);
            setShowAddToPlaylist(null);
            setIsCreatingPlaylist(false);
            setNewPlaylistName("");
            showToastMessage("Playlist created successfully!");
            navigate(`/playlist/${response.id}/edit`);
        } catch (error) {
            console.error("Error creating playlist:", error);
            showToastMessage("Failed to create playlist");
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className={styles.loadingContainer}>Loading artist profile...</div>
            </Layout>
        );
    }

    if (!artist) {
        return (
            <Layout>
                <div className={styles.errorContainer}>Artist not found</div>
            </Layout>
        );
    }

	return (
        <Layout>
            <div className={styles.container}>
                {showToast && (
                    <div className={styles.toastNotification}>{toastMessage}</div>
                )}
                <div className={styles.heroContainer}>
                    <div className={styles.heroBackground}>
                        <img
                            src={artist.profile_image || ""}
                            alt=""
                            className={styles.backgroundImage}
                        />
                        <div className={styles.overlay} />
                    </div>

                    <div className={styles.heroContent}>
                        <div className={styles.profile}>
                            <div className={styles.profileImage}>
                                <img
                                    src={artist.profile_image || ""}
                                    alt={artist.display_name}
                                />
                            </div>
                            <div className={styles.info}>
                                <h1 className={styles.name}>{artist.display_name}</h1>
                                {artist.location && (
                                    <div className={styles.meta}>
                                        <span className={styles.location}>{artist.location}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.content}>
                    <div className={styles.contentActions}>
                        <button type="button" className={styles.playAllButton}>
                            ▶ Play All
                        </button>
                    </div>

                    <div className={styles.songsTable}>
                        <div className={styles.songsHeader}>
                            <div className={styles.songNumber}>#</div>
                            <div>Title</div>
                            <div>Artist</div>
                            <div>Genre</div>
                            <div>Actions</div>
                        </div>

                        <div className={styles.songsList}>
                            {songs.map((song, index) => (
                                <SongListItem
                                    key={song.id}
                                    song={song}
                                    index={index}
                                    artistName={artist.display_name}
                                    onPlay={handlePlaySong}
                                    onAddToPlaylist={() => setShowAddToPlaylist(song.id)}
                                    showToastMessage={showToastMessage}
                                    userPlaylists={userPlaylists}
                                    isCreatingPlaylist={isCreatingPlaylist}
                                    newPlaylistName={newPlaylistName}
                                    onCreateNewPlaylist={handleCreateNewPlaylist}
                                    onNewPlaylistNameChange={setNewPlaylistName}
                                    onStartCreatePlaylist={() => setIsCreatingPlaylist(true)}
                                    handleAddToPlaylist={handleAddToPlaylist}
                                    showAddToPlaylist={showAddToPlaylist}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default ArtistPage;
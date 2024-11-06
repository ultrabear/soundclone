import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import {
    fetchFeaturedArtists,
    fetchNewReleases,
    fetchUserPlaylists,
} from '../store/homeSlice';
import '../styles/HomePage.css';

const HomePage = () => {
    const dispatch = useAppDispatch();
    const {
        featuredArtists,
        newReleases,
        userPlaylists,
        loading,
        error
    } = useAppSelector((state) => state.home);

    useEffect(() => {
        dispatch(fetchFeaturedArtists());
        dispatch(fetchNewReleases());
        dispatch(fetchUserPlaylists());
    }, [dispatch]);

    if (loading.artists || loading.releases || loading.playlists) {
        return <div className="loading-container">Loading...</div>;
    }

    if (error.artists || error.releases || error.playlists) {
        return <div className="error-container">Error loading data. Please try again later.</div>;
    }

    return (
        <div className="home-container">
            <aside className="sidebar">
                <div className="sidebar-section">
                    <h2 className="sidebar-heading">Your playlists</h2>
                    <ul className="playlist-list">
                        {userPlaylists.map((playlist) => (
                            <li key={playlist.id} className="playlist-item">
                                {playlist.name}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="sidebar-section">
                    <h2 className="sidebar-heading">Liked songs</h2>
                    <ul className="liked-songs-list">
                        <li className="liked-song-item placeholder">No liked songs yet</li>
                    </ul>
                </div>
            </aside>

            <main className="main-content">
                <section className="featured-artists">
                    <h2 className="section-heading">Featured artists</h2>
                    <div className="artists-grid">
                        {featuredArtists.map((artist) => (
                            <div key={artist.id} className="artist-card">
                                <div className="artist-image-container">
                                    {artist.profile_image ? (
                                        <img
                                            src={artist.profile_image}
                                            alt={artist.username}
                                            className="artist-image"
                                        />
                                    ) : (
                                        <div className="artist-image-placeholder" />
                                    )}
                                </div>
                                <h3 className="artist-name">{artist.stage_name || artist.username}</h3>
                                {artist.first_release && (
                                    <p className="artist-detail">
                                        Since {new Date(artist.first_release).getFullYear()}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                <section className="new-releases">
                    <h2 className="section-heading">New releases</h2>
                    <div className="releases-scroll">
                        {newReleases.map((song) => (
                            <div key={song.id} className="song-card">
                                <div className="song-image-container">
                                    {song.thumb_url ? (
                                        <img
                                            src={song.thumb_url}
                                            alt={song.name}
                                            className="song-image"
                                        />
                                    ) : (
                                        <div className="song-image-placeholder" />
                                    )}
                                </div>
                                <h3 className="song-title">{song.name}</h3>
                                {song.genre && (
                                    <p className="song-genre">{song.genre}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default HomePage;
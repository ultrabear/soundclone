import type React from "react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store";
import { setCurrentSong } from "../../store/playerSlice";
import { fetchFeaturedArtists } from "../../store/slices/artistsSlice";
import { fetchArtistSongs } from "../../store/slices/songsSlice";
import Layout from "../Layout/Layout";
import "./ArtistPage.css";

const ArtistPage: React.FC = () => {
	const { userId } = useParams<{ userId: string }>();
	const dispatch = useAppDispatch();
	const [showAddToPlaylist, setShowAddToPlaylist] = useState<number | null>(
		null,
	);

	const { featuredArtists, loading: artistLoading } = useAppSelector(
		(state) => state.artists,
	);
	const { artistSongs, loading: songsLoading } = useAppSelector(
		(state) => state.songs,
	);
	const { userPlaylists } = useAppSelector((state) => state.playlists);

	const artist = featuredArtists.find((a) => a.id === Number(userId));

	useEffect(() => {
		if (userId) {
			dispatch(fetchFeaturedArtists());
			dispatch(fetchArtistSongs(Number(userId)));
		}
	}, [dispatch, userId]);

	const handlePlaySong = (index: number) => {
		if (artistSongs[index]) {
			dispatch(setCurrentSong(artistSongs[index]));
		}
	};

	//   const handleAddToPlaylist = (songId: number, targetPlaylistId: number) => {
	//     dispatch(addSongToPlaylist({ playlistId: targetPlaylistId, songId }));
	//     setShowAddToPlaylist(null);
	//   };

	if (artistLoading || songsLoading) {
		return (
			<Layout>
				<div className="loading-container">Loading artist profile...</div>
			</Layout>
		);
	}

	if (!artist) {
		return (
			<Layout>
				<div className="error-container">Artist not found</div>
			</Layout>
		);
	}

	return (
		<Layout>
			<div className="artist-page">
				<div className="artist-hero-container">
					<div className="artist-hero-background">
						<img
							src={artist.profile_image || ""}
							alt=""
							className="hero-background-image"
						/>
						<div className="hero-overlay"></div>
					</div>

					<div className="artist-hero-content">
						<div className="artist-profile">
							<div className="artist-profile-image">
								<img src={artist.profile_image || ""} alt={artist.username} />
							</div>
							<div className="artist-info">
								<h1>{artist.stage_name || artist.username}</h1>
								{artist.location && (
									<div className="artist-meta">
										<span className="artist-location">{artist.location}</span>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>

				<div className="artist-content">
					<div className="content-actions">
						<button className="play-all-button">▶ Play All</button>
					</div>

					{/* Songs Table */}
					<div className="songs-table">
						<div className="songs-header">
							<div className="song-number">#</div>
							<div className="song-title-header">Title</div>
							<div className="song-artist-header">Artist</div>
							<div className="song-genre-header">Genre</div>
							<div className="song-actions-header">Actions</div>
						</div>

						<div className="songs-list">
							{artistSongs.map((song, index) => (
								<div key={song.id} className="song-row">
									<div className="song-number">{index + 1}</div>
									<div className="song-title-cell">
										<div className="song-thumbnail">
											{song.thumb_url && (
												<img src={song.thumb_url} alt={song.name} />
											)}
										</div>
										<span className="song-name">{song.name}</span>
									</div>
									<div className="song-artist">
										{song.user.stage_name || song.user.username}
									</div>
									<div className="song-genre">{song.genre}</div>
									<div className="song-actions">
										<button
											className="play-song-button"
											onClick={() => handlePlaySong(index)}
											aria-label="Play song"
										>
											▶
										</button>
										<button
											className="add-to-playlist-button"
											onClick={() => setShowAddToPlaylist(song.id)}
											aria-label="Add to playlist"
										>
											+
										</button>
										{showAddToPlaylist === song.id && userPlaylists && (
											<div className="playlist-dropdown">
												{userPlaylists.map((playlist) => (
													<button
														key={playlist.id}
														// onClick={() =>
														//   handleAddToPlaylist(song.id, playlist.id)
														// }
														className="playlist-option"
													>
														{playlist.name}
													</button>
												))}
											</div>
										)}
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</Layout>
	);
};

export default ArtistPage;

import type React from "react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store";
import { setCurrentSong } from "../../store/playerSlice";
import type { User } from "../../types";
import Layout from "../Layout/Layout";
import "./ArtistPage.css";
import { api } from "../../store/api";

//convert API user data to frontend User type
const transformUser = (apiUser: any): User => ({
	id: apiUser.id,
	username: apiUser.username,
	email: apiUser.email,
	profile_image: apiUser.profile_image ?? null,
	stage_name: apiUser.stage_name ?? null,
	first_release: apiUser.first_release ?? null,
	biography: apiUser.biography ?? null,
	location: apiUser.location ?? null,
	homepage: apiUser.homepage ?? null,
});

const ArtistPage: React.FC = () => {
	const { userId } = useParams<{ userId: string }>();
	const dispatch = useAppDispatch();
	const [showAddToPlaylist, setShowAddToPlaylist] = useState<number | null>(
		null,
	);
	const [artist, setArtist] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	const { artistSongs, loading: songsLoading } = useAppSelector(
		(state) => state.songs,
	);
	const { userPlaylists } = useAppSelector((state) => state.playlists);

	useEffect(() => {
		const loadArtist = async () => {
			if (userId) {
				try {
					setLoading(true);
					// Fetch and transform artist data
					const userData = await api.users.getOne(Number.parseInt(userId));
					setArtist(transformUser(userData));
					// Fetch artist's songs
					//   dispatch(fetchArtistSongs(Number.parseInt(userId)));
				} catch (error) {
					console.error("Error loading artist:", error);
				} finally {
					setLoading(false);
				}
			}
		};

		loadArtist();
	}, [dispatch, userId]);

	const handlePlaySong = (index: number) => {
		if (artistSongs[index]) {
			dispatch(setCurrentSong(artistSongs[index]));
		}
	};

	if (loading || songsLoading) {
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
													<button key={playlist.id} className="playlist-option">
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

import { useEffect, useRef, useState } from "react";
import styles from "./ArtistPage/ArtistPage.module.css";
import { useAppSelector } from "../store";
import { selectMyPlaylists } from "../store/slices/playlistsSlice";
import { useNavigate } from "react-router-dom";
import { api, type SongId } from "../store/api";

export function AddToPlaylist({
	close,
	showToastMessage,
	song,
}: {
	close: () => void;
	showToastMessage?: (_: string) => void;
	song: SongId;
}) {
	const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);
	const [newPlaylistName, setNewPlaylistName] = useState("");

	const userPlaylists = useAppSelector(selectMyPlaylists);
	const playlistPopup = useRef<HTMLDivElement>(null);
	const navigate = useNavigate();

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				playlistPopup?.current &&
				!playlistPopup.current.contains(event.target as any)
			) {
				close();
			}
		};

		document.addEventListener("mousedown", handleClickOutside);

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [close]);

	const handleAddToPlaylist = async (
		playlistId: number,
		songId: number,
		playlistName: string,
	) => {
		try {
			await api.playlists.addSong(playlistId, songId);
			close();
			showToastMessage?.(`Added song to ${playlistName}`);
		} catch (error) {
			console.error("Error adding song to playlist:", error);
			showToastMessage?.("Failed to add song to playlist");
		}
	};

	const handleCreateNewPlaylist = async (songId: number) => {
		if (!newPlaylistName.trim()) return;

		try {
			const response = await api.playlists.create({
				name: newPlaylistName,
			});

			await api.playlists.addSong(response.id, songId);
			close();
			showToastMessage?.("Playlist created successfully!");
			navigate(`/playlist/${response.id}/edit`);
		} catch (error) {
			console.error("Error creating playlist:", error);
			showToastMessage?.("Failed to create playlist");
		}
	};

	return (
		<div className={styles.playlistDropdown} ref={playlistPopup}>
			{userPlaylists.map((playlist) => (
				<button
					type="button"
					key={playlist.id}
					className={styles.playlistOption}
					onClick={() => handleAddToPlaylist(playlist.id, song, playlist.name)}
				>
					{playlist.name}
				</button>
			))}
			{isCreatingPlaylist ? (
				<div className={styles.playlistOption}>
					<input
						type="text"
						value={newPlaylistName}
						onChange={(e) => setNewPlaylistName(e.target.value)}
						placeholder="Enter playlist name"
						autoFocus
						onKeyDown={(e) => {
							if (e.key === "Enter" && handleCreateNewPlaylist) {
								handleCreateNewPlaylist(song);
							}
						}}
					/>
				</div>
			) : (
				<button
					type="button"
					className={`${styles.playlistOption} ${styles.createNewPlaylist}`}
					onClick={() => setIsCreatingPlaylist(true)}
				>
					Create New Playlist
				</button>
			)}
		</div>
	);
}

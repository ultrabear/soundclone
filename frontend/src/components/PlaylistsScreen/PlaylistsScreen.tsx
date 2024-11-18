import type React from "react";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import { fetchUserPlaylists } from "../../store/slices/playlistsSlice";
import "./PlaylistsScreen.css";
import type { ApiError } from "../../store/api";
import { PlaylistTile } from "./PlaylistTile";

interface PlaylistsScreenProps {}

const PlaylistsScreen: React.FC<PlaylistsScreenProps> = () => {
	const dispatch = useAppDispatch();
	const { playlists } = useAppSelector((state) => state.playlist);
	const topSongs = useAppSelector((state) => Object.values(state.song.songs));
	const [loadState, setLoadState] = useState<"no" | "pending" | "yes">("no");
	const [errors, setErrors] = useState<ApiError | undefined>(undefined);

	useEffect(() => {
		if (loadState === "no") {
			setLoadState("pending");
			(async () => {
				try {
					await dispatch(fetchUserPlaylists());
				} catch (e) {
					if (e instanceof Error) {
						setErrors(e as unknown as ApiError);
					}
				}
				setLoadState("yes");
			})();
		}
	}, [dispatch, loadState]);

	if (errors) {
		return <div className="error-container">{errors.message}</div>;
	}

	return (
		<div className="playlists-screen">
			{Object.keys(playlists).map((playlist) => (
				<PlaylistTile
					key={Number(playlist)}
					id={Number(playlist)}
					topSongs={topSongs}
				/>
			))}
		</div>
	);
};

export default PlaylistsScreen;

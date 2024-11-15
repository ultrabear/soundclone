import type React from "react";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import { fetchUserPlaylists } from "../../store/slices/playlistsSlice";
import "./PlaylistsScreen.css";
import type { ApiError } from "../../store/api";
import { PlaylistTile } from "./PlaylistTile";

type LoadState = "no" | "pending" | "yes";

const PlaylistsScreen: React.FC = () => {
	const dispatch = useAppDispatch();
	const { playlists } = useAppSelector((state) => state.playlist);

	const [loadstate, setLoadstate] = useState<LoadState>("no");
	const [errors, setErrors] = useState<ApiError | undefined>(undefined);

	if (loadstate === "no") {
		setLoadstate("pending");
		(async () => {
			try {
				await dispatch(fetchUserPlaylists());
			} catch (e) {
				if (e instanceof Error) {
					setErrors(e.api);
				}
			}
			setLoadstate("yes");
		})();
	}

	if (errors) {
		return <div className="error-container">{errors.message}</div>;
	}

	return (
		<div className="playlists-screen">
			{Object.keys(playlists).map((playlist) => (
				<PlaylistTile key={Number(playlist)} id={Number(playlist)} />
			))}
		</div>
	);
};

export default PlaylistsScreen;

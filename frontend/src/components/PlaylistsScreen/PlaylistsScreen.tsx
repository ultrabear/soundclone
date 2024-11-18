import type React from "react";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import { fetchUserPlaylists } from "../../store/slices/playlistsSlice";
import "./PlaylistsScreen.css";
import type { ApiError } from "../../store/api";
import { PlaylistTile } from "./PlaylistTile";

const PlaylistsScreen: React.FC = () => {
	const dispatch = useAppDispatch();
	const { playlists } = useAppSelector((state) => state.playlist);
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
						setErrors(e.api);
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
				<PlaylistTile key={Number(playlist)} id={Number(playlist)} />
			))}
		</div>
	);
};

export default PlaylistsScreen;

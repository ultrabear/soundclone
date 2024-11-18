import type React from "react";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import { fetchUserPlaylists } from "../../store/slices/playlistsSlice";
import "./PlaylistsScreen.css";
import type { ApiError } from "../../store/api";
import { PlaylistTile } from "./PlaylistTile";
import { selectUserPlaylists } from "../../store/selectors/userSelectors";

const MY_PLAYLIST_IMAGE =
	"https://soundclone-image-files.s3.us-east-1.amazonaws.com/my_playlists_image.png";

const PlaylistsScreen: React.FC = () => {
	const dispatch = useAppDispatch();
	const playlists = useAppSelector(selectUserPlaylists);
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
			<div className="user-view-image-container">
				<img
					className="user-view-top-image"
					src={MY_PLAYLIST_IMAGE}
					alt="my-playlists-image"
				/>
			</div>
			{playlists.map((playlist) => (
				<PlaylistTile key={playlist.id} id={playlist.id} />
			))}
		</div>
	);
};

export default PlaylistsScreen;

import { useState } from "react";
import { useAppDispatch } from "../../store";
import { PlaylistTile } from "./PlaylistTile";
import { getLikes } from "../../store/slices/songsSlice";

function LikesScreen() {
	const dispatch = useAppDispatch();
	const [loaded, setLoaded] = useState<boolean>(false);

	if (!loaded) {
		setLoaded(true);

		dispatch(getLikes());
	}

	return (
		<div className="playlists-screen">
			<PlaylistTile id="likes" />
		</div>
	);
}

export default LikesScreen;
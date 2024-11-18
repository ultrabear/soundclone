import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import { getLikes } from "../../store/slices/songsSlice";
import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "../../store";
import { SongListItem } from "../SongListItem";

const MY_LIKES_IMAGE =
	"https://soundclone-image-files.s3.us-east-1.amazonaws.com/my_likes_long.png";

const selectLikes = createSelector(
	(state: RootState) => state.session.likes,
	(likes) => Object.keys(likes).map(Number),
);

function LikesScreen() {
	const dispatch = useAppDispatch();
	const [loaded, setLoaded] = useState<boolean>(false);

	const likes = useAppSelector(selectLikes);

	if (!loaded) {
		setLoaded(true);

		dispatch(getLikes());
	}

	return (
		<>
			<div className="user-view-image-container">
				<img
					className="user-view-top-image"
					src={MY_LIKES_IMAGE}
					alt="my-likes-image"
				/>
			</div>
			{likes.map((s, i) => (
				<SongListItem key={s} index={i} songId={s} />
			))}
		</>
	);
}

export default LikesScreen;

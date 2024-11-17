import { useState } from "react";
import { ApiError, type SongId } from "../../store/api";
import { useModal } from "../../context/ModalCore";
import { useAppDispatch } from "../../store";
import "./DeleteSongModal.css";
import { deleteSongThunk } from "../../store/slices/songsSlice";

interface SongProps {
	songId: SongId;
}

const DeleteSongModal = (Props: SongProps): JSX.Element => {
	const { songId } = Props;
	const dispatch = useAppDispatch();
	const { closeModal } = useModal();
	const [errors, setErrors] = useState(
		{} as {
			server?: ApiError;
		},
	);

	const deleteSong = async () => {
		const response = await dispatch(deleteSongThunk(songId)).unwrap();
		if (response?.errors) {
			setErrors(response.errors);
		}
	};
	return (
		<section className="delete-modal flex-col">
			{errors.server && <p className="error-text">{errors.server.message}</p>}
			<h2>Permanently Delete Your Song?</h2>
			<div className="delete-buttons-row">
				<button onClick={deleteSong} className="delete-confirm">
					Yes
				</button>
				<button onClick={closeModal} className="delete-cancel">
					No
				</button>
			</div>
		</section>
	);
};

export default DeleteSongModal;

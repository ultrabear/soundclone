import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store";
import {
	searchContent,
	clearResults,
	selectSearchResults,
	selectSearchLoading,
} from "../../store/slices/searchSlice";
import styles from "./SearchBar.module.css";

const handleSearch = (
	searchQuery: string,
	dispatch: ReturnType<typeof useAppDispatch>,
	searchTimeout: ReturnType<typeof useRef<number | null>>,
) => {
	if (searchTimeout.current) {
		window.clearTimeout(searchTimeout.current);
	}

	if (searchQuery.length >= 2) {
		searchTimeout.current = window.setTimeout(() => {
			dispatch(searchContent(searchQuery));
		}, 300);
	} else {
		dispatch(clearResults());
	}
};

export default function SearchBar() {
	const [query, setQuery] = useState("");
	const [isOpen, setIsOpen] = useState(false);
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const results = useAppSelector(selectSearchResults);
	const isLoading = useAppSelector(selectSearchLoading);
	const searchRef = useRef<HTMLDivElement>(null);
	const searchTimeout = useRef<number | null>(null);

	useEffect(() => {
		handleSearch(query, dispatch, searchTimeout);

		const current = searchTimeout.current;

		return () => {
			if (current != null) {
				window.clearTimeout(current);
			}
		};
	}, [query, dispatch]);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				searchRef.current &&
				!searchRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const handleResultClick = (type: string, id: number) => {
		setIsOpen(false);
		setQuery("");
		dispatch(clearResults());

		switch (type) {
			case "song":
				navigate(`/songs/${id}`);
				break;
			case "artist":
				navigate(`/artists/${id}`);
				break;
			case "playlist":
				navigate(`/playlist/${id}`);
				break;
		}
	};

	return (
		<div ref={searchRef} className={styles.searchContainer}>
			<div className={styles.searchInputContainer}>
				<svg
					className={styles.searchIcon}
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<circle cx="11" cy="11" r="8" />
					<line x1="21" y1="21" x2="16.65" y2="16.65" />
				</svg>
				<input
					type="search"
					className={styles.searchInput}
					placeholder="Search for artists, songs, playlists..."
					value={query}
					onChange={(e) => {
						setQuery(e.target.value);
						setIsOpen(true);
					}}
					onFocus={() => setIsOpen(true)}
				/>
			</div>

			{isOpen && query.length >= 2 && (
				<div className={styles.resultsContainer}>
					{isLoading ? (
						<div className={styles.loadingState}>Loading...</div>
					) : results.length > 0 ? (
						<div>
							{results.map((result, index) => (
								<div
									key={`${result.type}-${result.id}-${index}`}
									className={styles.resultItem}
									onClick={() => handleResultClick(result.type, result.id)}
								>
									<div className={styles.resultContent}>
										{/* Thumbnail */}
										<div className={styles.thumbnailContainer}>
											{result.thumb_url ? (
												<img
													src={result.thumb_url}
													alt={result.name}
													className={styles.thumbnail}
													onError={(e) => {
														const target = e.target as HTMLImageElement;
														target.src = "/path/to/default-image.png"; // Add your default image path
													}}
												/>
											) : (
												<span className={styles.placeholderThumbnail}>
													{result.type === "artist" ? "👤" : "🎵"}
												</span>
											)}
										</div>

										{/* Info */}
										<div className={styles.resultInfo}>
											<div className={styles.resultName}>{result.name}</div>
											<div className={styles.resultMeta}>
												<span className={styles.resultType}>{result.type}</span>
												{result.artist_name && (
													<>
														<span className={styles.separator}>•</span>
														<span className={styles.resultArtist}>
															{result.artist_name}
														</span>
													</>
												)}
											</div>
										</div>
									</div>
								</div>
							))}
						</div>
					) : (
						<div className={styles.noResults}>No results found</div>
					)}
				</div>
			)}
		</div>
	);
}

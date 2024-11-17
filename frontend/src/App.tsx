import { useEffect, useState } from "react";
import {
	RouterProvider,
	createBrowserRouter,
	isRouteErrorResponse,
	useRouteError,
} from "react-router-dom";
import { Outlet } from "react-router-dom";
import ArtistPage from "./components/ArtistPage/ArtistPage";
import ArtistsSongsPage from "./components/ArtistsSongsPage/ArtistsSongsPage";
import EditPlaylistPage from "./components/EditPlaylistPage/EditPlaylistPage";
import HomePage from "./components/Home/HomePage";
import PlaylistView from "./components/Playlist/PlaylistView";
import SongDetailsPage from "./components/SongDetailsPage/SongDetailsPage";
import SongUploadForm from "./components/SongUploadForm/SongUploadForm";
import EditProfileForm from "./components/EditProfileForm/EditProfileForm";
import UserView from "./components/UserView/UserView";
import { Modal, ModalProvider } from "./context/Modal";
import { useAppDispatch } from "./store";
import { thunkAuthenticate } from "./store/slices/sessionSlice";

function ErrorBoundary() {
	const error = useRouteError();

	if (isRouteErrorResponse(error)) {
		return (
			<div className="error-container">
				<h1>Oops! {error.status}</h1>
				<p>{error.statusText}</p>
				<button onClick={() => window.history.back()} className="back-button">
					Go Back
				</button>
			</div>
		);
	}

	return (
		<div className="error-container">
			<h1>Oops!</h1>
			<p>Something went wrong</p>
			<button onClick={() => window.history.back()} className="back-button">
				Go Back
			</button>
		</div>
	);
}

function Layout() {
	const dispatch = useAppDispatch();
	const [isLoaded, setIsLoaded] = useState(false);

	useEffect(() => {
		dispatch(thunkAuthenticate()).finally(() => setIsLoaded(true));
	}, [dispatch]);

	if (!isLoaded) {
		return null;
	}

	return (
		<ModalProvider>
			<Outlet />
			<Modal />
		</ModalProvider>
	);
}

const router = createBrowserRouter([
	{
		element: <Layout />,
		errorElement: <ErrorBoundary />,
		children: [
			{
				path: "/",
				element: <HomePage />,
				errorElement: <ErrorBoundary />,
			},
			{
				path: "/home",
				element: <HomePage />,
				errorElement: <ErrorBoundary />,
			},
			{
				path: "/playlist/:id",
				element: <PlaylistView />,
				errorElement: <ErrorBoundary />,
			},
			{
				path: "/new-song",
				element: <SongUploadForm />,
				errorElement: <ErrorBoundary />,
			},
			{
				path: "/songs/:songId",
				element: <SongDetailsPage />,
				errorElement: <ErrorBoundary />,
			},
			{
				path: "/playlist/:id/edit",
				element: <EditPlaylistPage />,
				errorElement: <ErrorBoundary />,
			},
			{
				path: "/profile/edit",
				element: <EditProfileForm />,
				errorElement: <ErrorBoundary />,
			},
			{
				path: "/user",
				element: <Outlet />,
				errorElement: <ErrorBoundary />,
				children: [
					{
						index: true,
						element: <UserView tab="playlists" />,
					},
					{
						path: "playlists",
						element: <UserView tab="playlists" />,
					},
					{
						path: "likes",
						element: <UserView tab="likes" />,
					},
					{
						path: "uploads",
						element: <UserView tab="uploads" />,
					},
					{
						path: "profile",
						element: <UserView tab="profile" />,
					},
				],
			},
			{
				path: "/artists/:userId",
				element: <ArtistPage />,
				errorElement: <ErrorBoundary />,
				children: [
					{
						index: true,
						element: <ArtistsSongsPage />,
					},
					{
						path: "tracks",
						element: <ArtistsSongsPage />,
					},
				],
			},
		],
	},
]);

function App() {
	return <RouterProvider router={router} />;
}

export default App;

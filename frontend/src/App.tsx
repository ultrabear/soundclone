import { useEffect, useState } from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { Outlet } from "react-router-dom";
import ArtistPage from "./components/ArtistPage/ArtistPage";
import ArtistsSongsPage from "./components/ArtistsSongsPage/ArtistsSongsPage";
import EditPlaylistPage from "./components/EditPlaylistPage/EditPlaylistPage";
import HomePage from "./components/Home/HomePage";
import LoginFormPage from "./components/LoginFormPage/LoginFormPage";
import PlaylistView from "./components/Playlist/PlaylistView";
import SignupFormPage from "./components/SignupFormPage/SignupFormPage";
import SongDetailsPage from "./components/SongDetailsPage/SongDetailsPage";
import SongUploadForm from "./components/SongUploadForm/SongUploadForm";
import UserView from "./components/UserView/UserView";
import { Modal, ModalProvider } from "./context/Modal";
import { useAppDispatch } from "./store";
import { thunkAuthenticate } from "./store/slices/sessionSlice";

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
		children: [
			{
				path: "/",
				element: <HomePage />,
			},
			{
				path: "/home",
				element: <HomePage />,
			},
			{
				path: "login",
				element: <LoginFormPage />,
			},
			{
				path: "signup",
				element: <SignupFormPage />,
			},
			{
				path: "/playlist/:id",
				element: <PlaylistView />,
			},
			{
				path: "/new-song",
				element: <SongUploadForm />,
			},
			{
				path: "/songs/:songId",
				element: <SongDetailsPage />,
			},
			{
				path: "/playlist/:id/edit",
				element: <EditPlaylistPage />,
			},
			// Regular user view for playlists
			{
				path: "/user",
				element: <Outlet />,
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

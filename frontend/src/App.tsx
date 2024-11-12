import { RouterProvider, createBrowserRouter } from "react-router-dom";
import HomePage from "./components/Home/HomePage";
import LoginFormPage from "./components/LoginFormPage/LoginFormPage";
import PlaylistView from "./components/Playlist/PlaylistView";
import PlaylistsScreen from "./components/PlaylistsScreen/PlaylistsScreen";
import SignupFormPage from "./components/SignupFormPage/SignupFormPage";
import UserView from "./components/UserView/UserView";

import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Navigation from "./components/Navigation/Navigation";
import { Modal, ModalProvider } from "./context/Modal";
import { useAppDispatch } from "./store";
import { thunkAuthenticate } from "./store/session";

function Layout() {
	const dispatch = useAppDispatch();
	const [isLoaded, setIsLoaded] = useState(false);
	useEffect(() => {
		dispatch(thunkAuthenticate()).then(() => setIsLoaded(true));
	}, [dispatch]);

	return (
		<>
			<ModalProvider>
				<Navigation />
				{isLoaded && <Outlet />}
				<Modal />
			</ModalProvider>
		</>
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
				path: "/user/:userId",
				element: <UserView />,
				children: [
					{
						index: true,
						element: <PlaylistsScreen />,
					},
					{
						path: "playlists",
						element: <PlaylistsScreen />,
					},
					{
						path: "likes",
						element: <div>Likes Content</div>, // Placeholder
					},
					{
						path: "uploads",
						element: <div>Uploads Content</div>, // Placeholder
					},
					{
						path: "profile",
						element: <div>Profile Content</div>, // Placeholder
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

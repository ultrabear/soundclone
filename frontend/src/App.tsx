import { RouterProvider, createBrowserRouter } from "react-router-dom";
import HomePage from "./components/Home/HomePage";
import LoginFormPage from "./components/LoginFormPage/LoginFormPage";
import PlaylistView from "./components/Playlist/PlaylistView";
import SignupFormPage from "./components/SignupFormPage/SignupFormPage";
import SongUploadForm from "./components/SongUploadForm/SongUploadForm";

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
				path: "/new-song",
				element: <SongUploadForm />,
			},
		],
	},
]);

function App() {
	return <RouterProvider router={router} />;
}

export default App;

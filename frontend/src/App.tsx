
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import LoginFormPage from "./components/LoginFormPage/LoginFormPage";
import SignupFormPage from "./components/SignupFormPage/SignupFormPage";
import HomePage from './components/Home/HomePage';
import PlaylistView from './components/Playlist/PlaylistView';


import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { ModalProvider, Modal } from "./context/Modal";
import { thunkAuthenticate } from "./store/session";
import Navigation from "./components/Navigation/Navigation";
import { useAppDispatch } from "./store";

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
      }
		],
	},
]);

function App() {
	return <RouterProvider router={router} />;
}

export default App;
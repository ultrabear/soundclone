import { useState } from "react";
import { useModal } from "../../context/useModal";
import { useAppDispatch } from "../../store";
import { thunkLogin } from "../../store/slices/sessionSlice";
import "./LoginFormModal.css";
import { fetchUserPlaylists } from "../../store/slices/playlistsSlice";

function LoginFormModal() {
	const dispatch = useAppDispatch();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [errors, setErrors] = useState(
		{} as { email?: string; password?: string },
	);
	const { closeModal } = useModal();

	const login = async (credential: { email: string; password: string }) => {
		const serverResponse = await dispatch(thunkLogin(credential));

		console.log(serverResponse);

		if (serverResponse) {
			setErrors({
				email: serverResponse.errors?.email,
				password: serverResponse.errors?.password,
			});
		} else {
			dispatch(fetchUserPlaylists());
			closeModal();
		}
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		await login({ email, password });
	};

	return (
		<>
			<h1 className="login-header">Log In</h1>
			<form className="form-container flex-col" onSubmit={handleSubmit}>
				<label>
					Email
					<input
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
					/>
				</label>
				{errors.email && <p className="error-text">{errors.email}</p>}
				<label>
					Password
					<input
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
					/>
				</label>
				{errors.password && <p className="error-text">{errors.password}</p>}
				<button type="submit">Log In</button>
				<p
					onClick={() => {
						login({
							email: "demo@aa.io",
							password: "password",
						});
					}}
					className="demo-user"
				>
					Demo User
				</p>
			</form>
		</>
	);
}

export default LoginFormModal;

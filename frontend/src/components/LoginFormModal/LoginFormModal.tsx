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
	const [errors, setErrors] = useState({} as { credential?: string });
	const { closeModal } = useModal();

	const login = async (credential: { email: string; password: string }) => {
		const serverResponse = await dispatch(thunkLogin(credential));

		if (serverResponse) {
			setErrors({
				credential: "Invalid credentials",
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
			{errors.credential && <p className="error-text">{errors.credential}</p>}
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
				<label>
					Password
					<input
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
					/>
				</label>
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

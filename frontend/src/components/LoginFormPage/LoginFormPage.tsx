import { useState } from "react";
import { thunkLogin } from "../../store/session";
import { Navigate, useNavigate } from "react-router-dom";
import "./LoginForm.css";
import { useAppDispatch, useAppSelector } from "../../store";

function LoginFormPage() {
	const navigate = useNavigate();
	const dispatch = useAppDispatch();
	const sessionUser = useAppSelector((state) => state.session.user);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [errors, setErrors] = useState(
		{} as { email?: string; password?: string },
	);

	if (sessionUser) return <Navigate to="/" replace={true} />;

	const handleSubmit = async (e: React.FormEvent<HTMLElement>) => {
		e.preventDefault();

		const serverResponse = await dispatch(
			thunkLogin({
				email,
				password,
			}),
		);

		if (serverResponse) {
			setErrors(serverResponse);
		} else {
			navigate("/");
		}
	};

	return (
		<>
			<h1>Log In</h1>
			<form onSubmit={handleSubmit}>
				<label>
					Email
					<input
						type="text"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
					/>
				</label>
				{errors.email && <p>{errors.email}</p>}
				<label>
					Password
					<input
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
					/>
				</label>
				{errors.password && <p>{errors.password}</p>}
				<button type="submit">Log In</button>
			</form>
		</>
	);
}

export default LoginFormPage;

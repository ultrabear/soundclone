import { useState } from "react";
import { useModal } from "../../context/useModal";
import { useAppDispatch } from "../../store";
import { thunkSignup } from "../../store/slices/sessionSlice";

function SignupFormModal() {
	const dispatch = useAppDispatch();
	const [email, setEmail] = useState("");
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [errors, setErrors] = useState(
		{} as {
			server?: string;
			email?: string;
			username?: string;
			password?: string;
			confirmPassword?: string;
		},
	);
	const { closeModal } = useModal();

	const handleClientSideErrors = () => {
		const errors = {} as {
			password?: string;
			confirmPassword?: string;
		};

		if (password.length < 5) {
			errors.password = "Password must be at least 5 characters long";
		}

		if (password !== confirmPassword) {
			errors.confirmPassword =
				"Confirm Password field must match Password field";
		}

		return errors;
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		const clientSideErrors = handleClientSideErrors();

		if (Object.values(clientSideErrors).length > 0) {
			return setErrors(clientSideErrors);
		}

		setErrors({});

		const serverResponse = await dispatch(
			thunkSignup({
				email,
				username,
				password,
			}),
		);

		if (serverResponse) {
			setErrors({
				email: serverResponse.email?.[0],
				password: serverResponse.password?.[0],
				username: serverResponse.username?.[0],
			});
		} else {
			closeModal();
		}
	};

	return (
		<>
			<h1>Sign Up</h1>
			{errors.server && <p className="error-text">{errors.server}</p>}
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
					Username
					<input
						type="text"
						value={username}
						onChange={(e) => setUsername(e.target.value)}
						required
					/>
				</label>
				{errors.username && <p className="error-text">{errors.username}</p>}
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
				<label>
					Confirm Password
					<input
						type="password"
						value={confirmPassword}
						onChange={(e) => setConfirmPassword(e.target.value)}
						required
					/>
				</label>
				{errors.confirmPassword && (
					<p className="error-text">{errors.confirmPassword}</p>
				)}
				<button type="submit">Sign Up</button>
			</form>
		</>
	);
}

export default SignupFormModal;

import { useState } from "react";
import { useModal } from "../../context/useModal";
import { useAppDispatch } from "../../store";
import { thunkSignup } from "../../store/session";

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
			email?: string;
			password?: string;
			confirmPassword?: string;
		};
		const validEmailRe =
			/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

		if (!validEmailRe.test(email)) {
			errors.email = "Please enter a valid email address";
		}

		if (password.length < 5) {
			errors.password = "Password must be at least 5 characters long";
		}

		if (password !== confirmPassword) {
			errors.confirmPassword =
				"Confirm Password field must be the same as the Password field";
		}

		return errors;
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		// client side validation here
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
			setErrors(serverResponse);
		} else {
			closeModal();
		}
	};

	return (
		<>
			<h1>Sign Up</h1>
			{errors.server && <p>{errors.server}</p>}
			<form className="form-container col" onSubmit={handleSubmit}>
				<label>
					Email
					<input
						type="text"
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

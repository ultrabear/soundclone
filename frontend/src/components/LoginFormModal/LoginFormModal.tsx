import { useState } from "react";
import { useModal } from "../../context/useModal";
import { useAppDispatch } from "../../store";
import { thunkLogin } from "../../store/session";
import "./LoginFormModal.css";

function LoginFormModal() {
	const dispatch = useAppDispatch();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [errors, setErrors] = useState(
		{} as { email?: string; password?: string },
	);
	const { closeModal } = useModal();

	const handleClientSideErrors = () => {
		const errors = {} as {
			email?: string;
		};

		const validEmailRe =
			/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

		if (!validEmailRe.test(email)) {
			errors.email = "Please enter a valid email address";
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
			thunkLogin({
				email,
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
			<h1 className="login-header">Log In</h1>
			<form className="form-container flex-col" onSubmit={handleSubmit}>
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
						dispatch(
							thunkLogin({
								email: "demo@aa.io",
								password: "password",
							}),
						);
						closeModal();
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

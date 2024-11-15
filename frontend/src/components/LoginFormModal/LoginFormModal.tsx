import { useState } from "react";
import { useModal } from "../../context/useModal";
import { useAppDispatch } from "../../store";
import { thunkLogin } from "../../store/slices/sessionSlice";

function LoginFormModal() {
	const dispatch = useAppDispatch();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [errors, setErrors] = useState(
		{} as { email?: string; password?: string },
	);
	const { closeModal } = useModal();

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		const serverResponse = await dispatch(
			thunkLogin({
				email,
				password,
			}),
		);

		if (serverResponse) {
			setErrors({
				email: serverResponse.errors?.email,
				password: serverResponse.errors?.password,
			});
		} else {
			closeModal();
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

export default LoginFormModal;

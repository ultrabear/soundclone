import { useEffect, useRef, useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import { useAppDispatch, useAppSelector } from "../../store";
import { thunkLogout } from "../../store/session";
import LoginFormModal from "../LoginFormModal/LoginFormModal";
import SignupFormModal from "../SignupFormModal/SignupFormModal";
import OpenModalMenuItem from "./OpenModalMenuItem";

function ProfileButton() {
	const dispatch = useAppDispatch();
	const [showMenu, setShowMenu] = useState(false);
	const user = useAppSelector((store) => store.session.user);
	const ulRef: React.MutableRefObject<HTMLUListElement | null> = useRef(null);

	const toggleMenu = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		e.stopPropagation(); // Keep from bubbling up to document and triggering closeMenu
		setShowMenu(!showMenu);
	};

	useEffect(() => {
		if (!showMenu) return;

		const closeMenu = (e: MouseEvent) => {
			if (ulRef.current && !ulRef.current.contains(e.target as any)) {
				setShowMenu(false);
			}
		};

		document.addEventListener("click", closeMenu);

		return () => document.removeEventListener("click", closeMenu);
	}, [showMenu]);

	const closeMenu = () => setShowMenu(false);

	const logout = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		e.preventDefault();
		dispatch(thunkLogout());
		closeMenu();
	};

	return (
		<>
			<button onClick={toggleMenu}>
				<FaUserCircle />
			</button>
			{showMenu && (
				<ul className={"profile-dropdown"} ref={ulRef}>
					{user ? (
						<>
							<li>{user.username}</li>
							<li>{user.email}</li>
							<li>
								<button onClick={logout}>Log Out</button>
							</li>
						</>
					) : (
						<>
							<OpenModalMenuItem
								itemText="Log In"
								onItemClick={closeMenu}
								modalComponent={<LoginFormModal />}
							/>
							<OpenModalMenuItem
								itemText="Sign Up"
								onItemClick={closeMenu}
								modalComponent={<SignupFormModal />}
							/>
						</>
					)}
				</ul>
			)}
		</>
	);
}

export default ProfileButton;

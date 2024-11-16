// src/components/MobileMenu/MobileMenu.tsx
import { useState } from "react";
import { Link } from "react-router-dom";
import type { SessionUser, User } from "../../store/slices/types";
import LoginFormModal from "../LoginFormModal/LoginFormModal";
import SignupFormModal from "../SignupFormModal/SignupFormModal";
import OpenModalButton from "../OpenModalButton/OpenModalButton";
import { Sidebar } from "../Layout/Layout";
import "./MobileMenu.css";

interface MobileMenuProps {
	user: SessionUser | null;
	userDetails: User | null | undefined;
	onLogout: () => void;
	onProfileClick: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({
	user,
	userDetails,
	onLogout,
	onProfileClick,
}) => {
	const [isOpen, setIsOpen] = useState(false);

	const handleClose = () => {
		setIsOpen(false);
	};

	return (
		<div className="mobile-menu">
			<button
				onClick={() => setIsOpen(true)}
				className="mobile-menu-trigger"
				aria-label="Open menu"
			>
				<span className="hamburger-line"></span>
				<span className="hamburger-line"></span>
				<span className="hamburger-line"></span>
			</button>

			<div
				className={`mobile-menu-backdrop ${isOpen ? "open" : ""}`}
				onClick={handleClose}
			/>

			<div className={`mobile-menu-drawer ${isOpen ? "open" : ""}`}>
				<div className="mobile-menu-header">
					<button
						onClick={handleClose}
						className="mobile-close-button"
						aria-label="Close menu"
					>
						<span className="close-icon"></span>
					</button>
					<span className="mobile-menu-title">Menu</span>
				</div>

				<div className="mobile-user-section">
					{user ? (
						<>
							<div className="mobile-user-info">
								<div
									className="mobile-user-avatar"
									onClick={() => {
										onProfileClick();
										handleClose();
									}}
								>
									{userDetails?.profile_image && (
										<img src={userDetails.profile_image} alt={user.username} />
									)}
								</div>
								<div className="mobile-user-details">
									<div className="mobile-username">{user.username}</div>
									<button
										onClick={() => {
											onProfileClick();
											handleClose();
										}}
										className="mobile-profile-link"
									>
										View Profile
									</button>
								</div>
							</div>

							<div className="mobile-user-actions">
								<Link
									to="/new-song"
									className="mobile-upload-button"
									onClick={handleClose}
								>
									Upload
								</Link>
								<button
									onClick={() => {
										onLogout();
										handleClose();
									}}
									className="mobile-logout-button"
								>
									Log Out
								</button>
							</div>
						</>
					) : (
						<div className="mobile-auth-buttons">
							<div className="header-button button-secondary">
								<OpenModalButton
									buttonText="Log In"
									modalComponent={<LoginFormModal />}
								/>
							</div>
							<div className="header-button button-primary">
								<OpenModalButton
									buttonText="Sign Up"
									modalComponent={<SignupFormModal />}
								/>
							</div>
						</div>
					)}
				</div>

				<div className="mobile-menu-content">
					<Sidebar />
				</div>
			</div>
		</div>
	);
};

export default MobileMenu;

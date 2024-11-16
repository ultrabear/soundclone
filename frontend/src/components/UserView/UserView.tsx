import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../../store";
import EditProfileForm from "../EditProfileForm/EditProfileForm";
import Layout from "../Layout/Layout";
import PlaylistsScreen from "../PlaylistsScreen/PlaylistsScreen";
import "./UserView.css";
import LikesScreen from "../PlaylistsScreen/LikesScreen";

type TabType = "playlists" | "likes" | "uploads" | "profile";

function UserView({ tab }: { tab: TabType }) {
	const navigate = useNavigate();
	const [activeTab, setActiveTab] = useState<TabType>(tab);
	const { user } = useAppSelector((state) => state.session);

	const handleTabChange = (tab: TabType) => {
		setActiveTab(tab);
		navigate(`/user/${tab}`);
	};

	const renderContent = () => {
		switch (activeTab) {
			case "playlists":
				return <PlaylistsScreen />;
			case "likes":
				return <LikesScreen />;
			case "uploads":
				return <div>Uploads Content</div>;
			case "profile":
				return <EditProfileForm />;
			default:
				return <PlaylistsScreen />;
		}
	};

	return (
		<Layout>
			<div className="user-view-container">
				<div className="user-header">
					<h1>{user?.username}'s Library</h1>
					<nav className="user-nav">
						<div className="tab-list">
							<button
								type="button"
								className={`tab-button ${
									activeTab === "playlists" ? "active" : ""
								}`}
								onClick={() => handleTabChange("playlists")}
							>
								Playlists
							</button>
							<button
								type="button"
								className={`tab-button ${
									activeTab === "likes" ? "active" : ""
								}`}
								onClick={() => handleTabChange("likes")}
							>
								Likes
							</button>
							<button
								type="button"
								className={`tab-button ${
									activeTab === "uploads" ? "active" : ""
								}`}
								onClick={() => handleTabChange("uploads")}
							>
								Uploads
							</button>
							<button
								type="button"
								className={`tab-button ${
									activeTab === "profile" ? "active" : ""
								}`}
								onClick={() => handleTabChange("profile")}
							>
								Profile
							</button>
						</div>
					</nav>
				</div>
				<div className="user-content">{renderContent()}</div>
			</div>
		</Layout>
	);
}

export default UserView;

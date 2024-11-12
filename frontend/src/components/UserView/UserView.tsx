import type React from "react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppSelector } from "../../store";
import Layout from "../Layout/Layout";
import PlaylistsScreen from "../PlaylistsScreen/PlaylistsScreen";
import "./UserView.css";

type TabType = "playlists" | "likes" | "uploads" | "profile";

const UserView: React.FC = () => {
	const { userId } = useParams<{ userId: string }>();
	const navigate = useNavigate();
	const [activeTab, setActiveTab] = useState<TabType>("playlists");
	const { user } = useAppSelector((state) => state.session);

	const handleTabChange = (tab: TabType) => {
		setActiveTab(tab);
		navigate(`/user/${userId}/${tab}`);
	};

	const renderContent = () => {
		switch (activeTab) {
			case "playlists":
				return <PlaylistsScreen />;
			case "likes":
				return <div>Likes Content</div>;
			case "uploads":
				return <div>Uploads Content</div>;
			case "profile":
				return <div>Profile Content</div>;
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
								className={`tab-button ${activeTab === "playlists" ? "active" : ""}`}
								onClick={() => handleTabChange("playlists")}
							>
								Playlists
							</button>
							<button
								className={`tab-button ${activeTab === "likes" ? "active" : ""}`}
								onClick={() => handleTabChange("likes")}
							>
								Likes
							</button>
							<button
								className={`tab-button ${activeTab === "uploads" ? "active" : ""}`}
								onClick={() => handleTabChange("uploads")}
							>
								Uploads
							</button>
							<button
								className={`tab-button ${activeTab === "profile" ? "active" : ""}`}
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
};

export default UserView;

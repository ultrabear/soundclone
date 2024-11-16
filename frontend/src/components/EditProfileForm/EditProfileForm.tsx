import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store";
import {
	createNewArtistThunk,
	getUserDetails,
} from "../../store/slices/userSlice";
import "./EditProfileForm.css";

type LoadingState = "no" | "loading" | "response" | "finished";

const EditProfileForm = (): JSX.Element => {
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const sessionUser = useAppSelector((state) => state.session.user);
	const users = useAppSelector((state) => state.user.users);
	const [stageName, setStageName] = useState<string>("");
	const [firstRelease, setFirstRelease] = useState<string>("");
	const [biography, setBiography] = useState<string>("");
	const [location, setLocation] = useState<string>("");
	const [homepage, setHomepage] = useState<string>("");
	const [loading, setLoading] = useState<LoadingState>("no");
	const [existingProfileImage, setExistingProfileImage] = useState<
		string | null
	>(null);
	const [imageToUpload, setImageToUpload] = useState<File | null>(null);
	const [errors, setErrors] = useState(
		{} as {
			server?: string;
		},
	);

	if (!sessionUser) {
		navigate("/");
		return <></>; // UserView component requires an element to be returned here
	}

	if (loading === "no") {
		setLoading("loading");
		dispatch(getUserDetails(sessionUser.id)).then(() => setLoading("response"));
	} else if (loading === "response") {
		setLoading("finished");
		const currentUsersDetails = users[sessionUser.id];
		if (currentUsersDetails?.display_name)
			setStageName(currentUsersDetails.display_name);
		if (currentUsersDetails?.first_release)
			setFirstRelease(currentUsersDetails.first_release);
		if (currentUsersDetails?.biography)
			setBiography(currentUsersDetails.biography);
		if (currentUsersDetails?.location)
			setLocation(currentUsersDetails.location);
		if (currentUsersDetails?.homepage_url)
			setHomepage(currentUsersDetails.homepage_url);
		if (currentUsersDetails?.profile_image)
			setExistingProfileImage(currentUsersDetails.profile_image);
	}

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		const formData = new FormData();

		if (stageName) formData.append("stage_name", stageName);
		if (firstRelease) formData.append("first_release", firstRelease);
		if (biography) formData.append("biography", biography);
		if (location) formData.append("location", location);
		if (homepage) formData.append("homepage", homepage);
		if (imageToUpload) formData.append("profile_image", imageToUpload);

		const serverResponse = await dispatch(createNewArtistThunk(formData));

		if (serverResponse) {
			setErrors({
				server: "Failed to update artist profile",
			});
		}
	};

	return (
		<section className="edit-profile-section flex-col">
			{errors.server && <p className="error-text">{errors.server}</p>}
			{existingProfileImage && (
				<img
					className="profile-picture"
					src={existingProfileImage}
					alt="your profile image"
				/>
			)}
			<form
				className="upload-song-form  flex-col"
				encType="multipart/form-data"
				onSubmit={handleSubmit}
			>
				<div className="upload-form-field flex-col">
					<button className="choose-file-button" type="button">
						<label className="label-on-button" htmlFor="profile-image-file">
							Edit Profile Image
						</label>
					</button>
					<input
						hidden
						id="profile-image-file"
						type="file"
						accept="image/png, image/jpeg, image/webp, image/jpg"
						onChange={(e) => {
							if (e.target.files?.length) setImageToUpload(e.target.files[0]!);
						}}
					/>
				</div>
				<div className="upload-form-field flex-col">
					<label className="upload-form-text-label" htmlFor="stage-name">
						Your Stage Name
					</label>
					<input
						className="upload-form-text-input"
						id="stage-name"
						type="text"
						value={stageName}
						onChange={(e) => setStageName(e.target.value)}
					/>
				</div>
				<div className="upload-form-field flex-col">
					<label className="upload-form-text-label" htmlFor="first-release">
						Your First Release
					</label>
					<input
						className="upload-form-text-input"
						id="first-release"
						type="text"
						value={firstRelease}
						onChange={(e) => setFirstRelease(e.target.value)}
					/>
				</div>
				<div className="upload-form-field flex-col">
					<label className="upload-form-text-label" htmlFor="biography">
						Your Bio
					</label>
					<input
						className="upload-form-text-input"
						id="biography"
						type="textarea"
						maxLength={400}
						value={biography}
						onChange={(e) => setBiography(e.target.value)}
					/>
				</div>
				<div className="upload-form-field flex-col">
					<label className="upload-form-text-label" htmlFor="location">
						Your Location
					</label>
					<input
						className="upload-form-text-input"
						id="location"
						type="text"
						value={location}
						onChange={(e) => setLocation(e.target.value)}
					/>
				</div>
				<div className="upload-form-field flex-col">
					<label className="upload-form-text-label" htmlFor="homepage">
						Link To Your Website
					</label>
					<input
						className="upload-form-text-input"
						id="homepage"
						type="text"
						value={homepage}
						onChange={(e) => setHomepage(e.target.value)}
					/>
				</div>

				<button className="song-upload-button" type="submit">
					Update Profile
				</button>
			</form>
		</section>
	);
};

export default EditProfileForm;

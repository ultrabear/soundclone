import { useState, useEffect } from "react"; // Add useEffect import
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

	const isArtist = useAppSelector((state) => {
		const userId = sessionUser?.id;
		if (!userId) return false;
		return (state.user.users[userId]?.num_songs_by_artist ?? 0) > 0;
	});

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
	const [errors, setErrors] = useState<{ server?: string }>({});

	useEffect(() => {
		if (!sessionUser) {
			navigate("/");
			return;
		}

		if (loading === "no") {
			setLoading("loading");
			dispatch(getUserDetails(sessionUser.id)).then(() =>
				setLoading("response"),
			);
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
	}, [sessionUser, loading, users, dispatch, navigate]);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setErrors({});

		const formData = new FormData();

		if (imageToUpload) formData.append("profile_image", imageToUpload);

		if (stageName) formData.append("stage_name", stageName);
		if (firstRelease) formData.append("first_release", firstRelease);
		if (biography) formData.append("biography", biography);
		if (location) formData.append("location", location);
		if (homepage) formData.append("homepage", homepage);

		try {
			const response = await dispatch(createNewArtistThunk(formData));

			if (response.payload) {
				if (typeof response.payload === "string") {
					setErrors({ server: response.payload });
				} else if (typeof response.payload === "object") {
					if ("errors" in response.payload) {
						const errorPayload = response.payload as {
							errors: string | Record<string, string>;
						};
						if (typeof errorPayload.errors === "string") {
							setErrors({ server: errorPayload.errors });
						} else {
							setErrors({
								server: Object.values(errorPayload.errors).join(", "),
							});
						}
					} else {
						setErrors({
							server: JSON.stringify(response.payload, null, 2),
						});
					}
				}
			} else {
				navigate("/user/profile");
			}
		} catch (err) {
			console.error("Profile update error:", err);
			let errorMessage = "An unexpected error occurred";

			if (err instanceof Error) {
				const apiError = (err as any).api;
				if (apiError?.errors) {
					if (typeof apiError.errors === "string") {
						errorMessage = apiError.errors;
					} else {
						errorMessage = Object.values(apiError.errors).join(", ");
					}
				} else if (apiError?.message) {
					errorMessage = apiError.message;
				} else {
					errorMessage = err.message;
				}
			}

			setErrors({ server: errorMessage });
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
				className="upload-song-form flex-col"
				encType="multipart/form-data"
				onSubmit={handleSubmit}
			>
				<div className="upload-form-field flex-col">
					<button className="choose-file-button" type="button">
						<label className="label-on-button" htmlFor="profile-image-file">
							{imageToUpload
								? imageToUpload.name
								: existingProfileImage
									? "Edit Profile Image"
									: "Add Profile Image"}
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

				{!isArtist && (
					<p className="info-text">
						Note: Your artist profile will become public once you upload your
						first song!
					</p>
				)}

				<button className="song-upload-button" type="submit">
					Update Profile
				</button>
			</form>
		</section>
	);
};

export default EditProfileForm;

// // dispatch a thunk to get the current_user's artist info so that fields can be pre-populated
// // if the response is ok, that info will be used to populate the fields
// // if the response is not ok return (ApiError(message="Not an artist", errors={"artist_id": f"User {artist_id} is not an artist"}), 404), the form will just be empty fields
// // this will change once a user is allowed to post to api/artists without having any uploads yet

// import { useState } from "react";
// import { useAppDispatch, useAppSelector } from "../../store";
// import { createNewArtistThunk, getUserDetails } from "../../store/slices/userSlice";
// import "./EditProfileForm.css";

// const ALLOWED_IMAGE_EXTENSIONS = new Set(["png", "jpg", "jpeg", "webp"]);

// const SongUploadForm: () => JSX.Element = () => {
//   const dispatch = useAppDispatch();
//   const sessionUser = useAppSelector((state) => state.session.user);
//   const [stageName, setStageName] = useState<string>("");
//   const [firstRelease, setFirstRelease] = useState<string>("");
//   const [biography, setBiography] = useState<string>("");
//   const [location, setLocation] = useState<string>("");
//   const [homepage, setHomepage] = useState<string>("");
//   const [profileImage, setProfileImage] = useState<File | null>(null);
//   const [errors, setErrors] = useState(
//     {} as {
//       server?: string;
//       profileImage?: string;
//     }
//   );

//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();

//     const formData = new FormData();

//     if (stageName) formData.append("stage_name", stageName);
//     if (firstRelease) formData.append("first_release", firstRelease);
//     if (biography) formData.append("biography", biography);
//     if (location) formData.append("location", location);
//     if (homepage) formData.append("homepage", homepage);
//     if (profileImage) formData.append("profile_image", profileImage);

//     // const serverResponse = await dispatch(createNewArtistThunk(formData));

//     // console.log("server response: ", serverResponse);
//   };

//   return (
//       <h1>Track info</h1>
//       {errors.server && <p>{errors.server}</p>}
//       <form
//         className="upload-song-form  flex-col"
//         encType="multipart/form-data"
//         onSubmit={handleSubmit}
//       >
//         <div className="upload-form-field flex-col">
//           <label className="upload-form-text-label" htmlFor="title">
//             Track title<span className="required-star">*</span>
//           </label>
//           <input
//             className="upload-form-text-input"
//             id="title"
//             type="text"
//             value={name}
//             onChange={(e) => setName(e.target.value)}
//             required
//           />
//         </div>
//         <div className="upload-form-field flex-col">
//           <label className="upload-form-text-label" htmlFor="genre">
//             Genre
//           </label>
//           <input
//             className="upload-form-text-input"
//             id="genre"
//             type="text"
//             value={genre}
//             onChange={(e) => setGenre(e.target.value)}
//           />
//         </div>
//         <div className="upload-form-field flex-col">
//           <button className="choose-file-button" type="button">
//             <label className="label-on-button" htmlFor="song-thumbnail">
//               {thumbUrl ? thumbUrl.name : "Add Track Artwork"}
//             </label>
//           </button>
//           <input
//             hidden
//             id="song-thumbnail"
//             type="file"
//             accept="image/png, image/jpeg, image/webp, image/jpg"
//             onChange={(e) => {
//               if (e.target.files?.length) setThumbUrl(e.target.files[0]!);
//             }}
//           />
//           {errors.thumbUrl && <p>{errors.thumbUrl}</p>}
//         </div>

//         <button className="song-upload-button" type="submit">
//           Update Profile
//         </button>
//       </form>
//   );
// };

// export default SongUploadForm;

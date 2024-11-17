import { createAsyncThunk } from "@reduxjs/toolkit";
import { usersSlice } from "./userSlice";
import type { User } from "./types";

export const updateUserProfileThunk = createAsyncThunk(
	"users/updateProfile",
	async (userData: FormData, { dispatch }) => {
		try {
			const response = await fetch("/api/profile", {
				method: "POST",
				body: userData,
				credentials: "include",
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.errors || "Failed to update profile");
			}

			const updatedUser = (await response.json()) as User;
			dispatch(usersSlice.actions.addUser(updatedUser));
			return null;
		} catch (e) {
			console.error("Profile update error:", e);
			return e instanceof Error ? e.message : "Failed to update profile";
		}
	},
);

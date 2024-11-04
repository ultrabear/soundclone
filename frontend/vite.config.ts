import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
//@ts-expect-error no typestubs
import eslint from "vite-plugin-eslint";

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
	plugins: [
		react(),
		eslint({
			lintOnStart: true,
			failOnError: mode === "production",
		}),
	],
	server: { proxy: { "/api": "http://localhost:5000" } },
}));

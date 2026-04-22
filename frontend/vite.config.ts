import { defineConfig } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import stylex from "@stylexjs/unplugin";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
	resolve: {
		tsconfigPaths: true,
	},
	server: {
		proxy: {
			"/api": {
				target: "http://localhost:3000",
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/api/, ""),
			},
		},
	},
	plugins: [
		stylex.vite({
			// StyleX configuration options
			useCSSLayers: true,
		}),
		react(),
		babel({ presets: [reactCompilerPreset()] }),
	],
});

import { defineConfig } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import stylex from "@stylexjs/unplugin";

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		stylex.vite({
			// StyleX configuration options
			useCSSLayers: true,
		}),
		react(),
		babel({ presets: [reactCompilerPreset()] }),
	],
});

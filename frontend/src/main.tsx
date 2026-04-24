import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

import * as stylex from "@stylexjs/stylex";
import { colors } from "./vars.stylex.ts";

const styles = stylex.create({
	root: {
		margin: 0,
		padding: 0,
		backgroundColor: colors.background,
	},
});

document.documentElement.className = stylex.props(styles.root).className ?? "";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<App />
	</StrictMode>,
);

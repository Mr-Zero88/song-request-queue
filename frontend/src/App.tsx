import { session } from "@/api/api.ts";
import Login from "@/components/login";

import * as stylex from "@stylexjs/stylex";
import { layout } from "./vars.stylex.ts";
import User from "./components/user.tsx";
import Admin from "./components/admin.tsx";

const styles = stylex.create({
	root: {
		maxWidth: layout.contentMaxWidth,
		margin: "auto",
		display: "flex",
		flexDirection: "column",
	},
});

function App() {
	return (
		<div {...stylex.props(styles.root)}>
			{session.value != null ? (
				session.value.username === "mr.zero88" ? (
					<Admin />
				) : (
					<User />
				)
			) : (
				<Login />
			)}
		</div>
	);
}

export default App;

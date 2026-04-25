import { session } from "@/api/api.ts";
import Login from "@/components/login";

import * as stylex from "@stylexjs/stylex";
import { layout } from "./vars.stylex.ts";
import User from "./components/user.tsx";
import Admin from "./components/admin.tsx";

const ADMIN_USERNAME = "mr.zero88";

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
				session.value.username === ADMIN_USERNAME ? (
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

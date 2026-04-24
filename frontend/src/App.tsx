import { addToQueue, queues, session } from "@/api/api.ts";
import Login from "@/components/login";
import Queue from "@/components/queue";

import * as stylex from "@stylexjs/stylex";
import { layout, colors, fontSizes, radius } from "./vars.stylex.ts";
import ClipboardButton from "./components/clipboardButton.tsx";

const styles = stylex.create({
	root: {
		maxWidth: layout.contentMaxWidth,
		margin: "auto",
		display: "flex",
		flexDirection: "column",
	},
	queues: {},
	button: {
		fontSize: fontSizes.xxl,
		margin: "auto",
		color: colors.background,
		backgroundColor: colors.primaryText,
		borderRadius: radius.sm,
		borderStyle: "solid",
		padding: "0.2rem 1.3rem",
	},
});

let f = (link: string) => {
	const requestQueue = queues.value.find(
		(q) => q.value.name == "Request Queue",
	);
	if (requestQueue) {
		addToQueue(requestQueue.value.id, link);
	}
};

function App() {
	return (
		<div {...stylex.props(styles.root)}>
			{session.value != null ? (
				<>
					<ClipboardButton {...stylex.props(styles.button)} onValueChange={f}>
						Request Link From Clipboard
					</ClipboardButton>
					{queues.value.map((queue, key) => (
						<div key={key + queue.value.id} {...stylex.props(styles.queues)}>
							<Queue key={key + queue.value.id} queue={queue} />
						</div>
					))}
				</>
			) : (
				<>
					<Login />
				</>
			)}
		</div>
	);
}

export default App;

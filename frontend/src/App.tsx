import { addToQueue, queues, session } from "@/api/api.ts";
import Login from "@/components/login";
import Queue from "@/components/queue";

import * as stylex from "@stylexjs/stylex";
import { layout, colors } from "./vars.stylex.ts";
import ClipboardButton from "./components/clipboardButton.tsx";

const styles = stylex.create({
	root: {
		margin: 0,
		padding: 0,
		backgroundColor: colors.background,
		minHeight: "100vh",
		width: "100%",
	},
	queues: {
		maxWidth: layout.contentMaxWidth,
		margin: "auto",
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
					<ClipboardButton onValueChange={f}>
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

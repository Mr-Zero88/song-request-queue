import { addToQueue, queues } from "@/api/api.ts";
import Queue from "@/components/queue";

import * as stylex from "@stylexjs/stylex";
import { colors, fontSizes, radius } from "../vars.stylex.ts";
import ClipboardButton from "@/components/clipboardButton.tsx";

const styles = stylex.create({
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

const f = (link: string) => {
	const requestQueue = queues.value.find(
		(q) => q.value.name == "Request Queue",
	);
	if (requestQueue) {
		void addToQueue(requestQueue.value.id, link);
	}
};
export default function Admin() {
	return (
		<>
			<ClipboardButton {...stylex.props(styles.button)} onValueChange={f}>
				Request Link From Clipboard
			</ClipboardButton>
			{queues.value.map((queue, key) => (
				<div key={key + queue.value.id} {...stylex.props(styles.queues)}>
					<Queue
						key={key + queue.value.id}
						queue={queue}
						showMoveToPlaybackButton
					/>
				</div>
			))}
		</>
	);
}

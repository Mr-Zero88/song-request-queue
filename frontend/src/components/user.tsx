import { addToQueue, queues } from "@/api/api.ts";
import ClipboardButton from "@/components/clipboardButton.tsx";
import NowPlaying from "@/components/nowPlaying.tsx";
import Queue from "@/components/queue";

import * as stylex from "@stylexjs/stylex";
import { colors, fontSizes, radius } from "../vars.stylex.ts";

const styles = stylex.create({
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

const requestLink = (link: string) => {
	const requestQueue = queues.value.find(
		(q) => q.value.name == "Request Queue",
	);
	if (requestQueue) {
		void addToQueue(requestQueue.value.id, link);
	}
};

export default function User() {
	return (
		<>
			<NowPlaying />
			<ClipboardButton
				{...stylex.props(styles.button)}
				onValueChange={requestLink}
			>
				Request Link From Clipboard
			</ClipboardButton>

			{queues.value.map((queue, key) => (
				<div key={key + queue.value.id}>
					<Queue key={key + queue.value.id} queue={queue} />
				</div>
			))}
		</>
	);
}

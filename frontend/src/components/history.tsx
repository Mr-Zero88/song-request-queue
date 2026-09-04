import { useSignal } from "@preact/signals-react";
import * as stylex from "@stylexjs/stylex";
import { History as HistoryIcon } from "lucide-react";

import { queues } from "@/api/api.ts";
import Queue from "@/components/queue.tsx";
import Button from "@/components/ui/button.tsx";
import { PLAYBACK_QUEUE_ID } from "@/constants.ts";

import { space } from "../vars.stylex.ts";

const styles = stylex.create({
	toggleRow: {
		display: "flex",
		justifyContent: "center",
		marginTop: space.md,
	},
});

export default function History() {
	const open = useSignal(false);
	const playbackQueue = queues.value.find(
		(queue) => queue.value.id === PLAYBACK_QUEUE_ID,
	);
	if (!playbackQueue) return null;

	// the last song in the playback queue is "now playing"; everything
	// before it has already been played, most recent first
	const played = playbackQueue.value.songs.slice(0, -1).reverse();

	return (
		<>
			<div {...stylex.props(styles.toggleRow)}>
				<Button variant="ghost" size="sm" onClick={() => (open.value = !open.value)}>
					<HistoryIcon size={14} />
					{open.value ? "Hide History" : "Show History"}
				</Button>
			</div>

			{open.value ? (
				<Queue
					queue={playbackQueue}
					songs={played}
					title="History"
					titleIcon={HistoryIcon}
					emptyMessage="Nothing has been played yet."
					showVoteCount
				/>
			) : null}
		</>
	);
}

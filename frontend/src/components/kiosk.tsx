import { QRCodeSVG } from "qrcode.react";
import { useSignal } from "@preact/signals-react";
import * as stylex from "@stylexjs/stylex";
import { QrCode } from "lucide-react";

import { addToQueue, queues } from "@/api/api.ts";
import NowPlaying from "@/components/nowPlaying.tsx";
import Queue from "@/components/queue.tsx";
import SearchBar from "@/components/searchBar.tsx";
import History from "@/components/history.tsx";
import Button from "@/components/ui/button.tsx";
import Modal from "@/components/ui/modal.tsx";
import { PLAYBACK_QUEUE_ID, REQUEST_QUEUE_NAME } from "@/constants.ts";

import { colors, fontSizes, fontWeights, space } from "../vars.stylex.ts";

const styles = stylex.create({
	root: {
		display: "flex",
		flexDirection: "column",
		gap: space.lg,
	},
	qrButtonRow: {
		display: "flex",
		justifyContent: "center",
	},
	qrModal: {
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		gap: space.md,
	},
	qrLabel: {
		color: colors.primaryText,
		fontSize: fontSizes.lg,
		fontWeight: fontWeights.semibold,
		margin: 0,
	},
});

const requestLink = (link: string) => {
	const requestQueue = queues.value.find(
		(q) => q.value.name === REQUEST_QUEUE_NAME,
	);
	if (requestQueue) {
		void addToQueue(requestQueue.value.id, link);
	}
};

function JoinQrButton() {
	const open = useSignal(false);
	const joinUrl = `${window.location.origin}/`;

	return (
		<>
			<div {...stylex.props(styles.qrButtonRow)}>
				<Button variant="secondary" onClick={() => (open.value = true)}>
					<QrCode size={16} />
					Scan to join on your phone
				</Button>
			</div>

			<Modal open={open.value} onClose={() => (open.value = false)}>
				<div {...stylex.props(styles.qrModal)}>
					<QRCodeSVG value={joinUrl} size={320} />
					<p {...stylex.props(styles.qrLabel)}>Scan to join</p>
				</div>
			</Modal>
		</>
	);
}

export default function Kiosk() {
	return (
		<div {...stylex.props(styles.root)}>
			<SearchBar onSelect={requestLink} />

			<NowPlaying />

			{queues.value.map((queue) =>
				queue.value.id !== PLAYBACK_QUEUE_ID ? (
					<Queue
						key={queue.value.id}
						queue={queue}
						showMoveToPlaybackButton={false}
						showRemoveButton={false}
					/>
				) : null,
			)}

			<History />

			<JoinQrButton />
		</div>
	);
}

import { QRCodeSVG } from "qrcode.react";
import { useSignal } from "@preact/signals-react";
import * as stylex from "@stylexjs/stylex";
import { QrCode } from "lucide-react";

import { addToQueue, queues } from "@/api/api.ts";
import ActionError, { actionError } from "@/components/actionError.tsx";
import Footer from "@/components/footer.tsx";
import History from "@/components/history.tsx";
import NowPlaying from "@/components/nowPlaying.tsx";
import Queue from "@/components/queue.tsx";
import QueueClosedBanner from "@/components/queueClosedBanner.tsx";
import SearchBar from "@/components/searchBar.tsx";
import Button from "@/components/ui/button.tsx";
import Modal from "@/components/ui/modal.tsx";
import {
	MOCK_QUEUE_CLOSED,
	PLAYBACK_QUEUE_ID,
	REQUEST_QUEUE_NAME,
} from "@/constants.ts";

import { colors, fontSizes, fontWeights, space } from "../vars.stylex.ts";

const styles = stylex.create({
	root: {
		display: "flex",
		flexDirection: "column",
		gap: space.md,
	},
	// Sits where the guest view puts its greeting and log-out button. The kiosk
	// is a shared screen, so it has neither — the way in is the QR code.
	header: {
		display: "flex",
		justifyContent: "flex-end",
		alignItems: "center",
		marginBottom: space.md,
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

// No session on a kiosk, so the request stays anonymous rather than being
// attributed to whoever happens to be signed in on that machine.
const requestLink = async (link: string) => {
	const requestQueue = queues.value.find(
		(q) => q.value.name === REQUEST_QUEUE_NAME,
	);
	if (!requestQueue) {
		actionError.value =
			"Couldn't find the request queue — it may still be loading. Try again in a moment.";
		return;
	}

	actionError.value = null;
	const error = await addToQueue(requestQueue.value.id, link);
	if (error) {
		actionError.value = error.message;
	}
};

function JoinQrButton() {
	const open = useSignal(false);
	const joinUrl = `${window.location.origin}/`;

	return (
		<>
			<Button variant="secondary" onClick={() => (open.value = true)}>
				<QrCode size={16} />
				Scan to join on your phone
			</Button>

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
			<div {...stylex.props(styles.header)}>
				<JoinQrButton />
			</div>

			<ActionError />

			{MOCK_QUEUE_CLOSED ? (
				<QueueClosedBanner />
			) : (
				<SearchBar onSelect={(link) => void requestLink(link)} />
			)}

			<NowPlaying />

			{queues.value.map((queue) =>
				queue.value.id !== PLAYBACK_QUEUE_ID ? (
					<Queue
						key={queue.value.id}
						queue={queue}
						// Scores are shown, but not the buttons: voting is tied to a
						// username and the kiosk has no one signed in.
						showVoteCount={queue.value.name === REQUEST_QUEUE_NAME}
					/>
				) : null,
			)}

			<History />
			<Footer />
		</div>
	);
}

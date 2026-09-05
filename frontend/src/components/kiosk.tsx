import { QRCodeSVG } from "qrcode.react";
import * as stylex from "@stylexjs/stylex";
import { Smartphone } from "lucide-react";

import { useSignal } from "@preact/signals-react";

import { queues } from "@/api/api.ts";
import { requestSong } from "@/requestSong.ts";
import Footer from "@/components/footer.tsx";
import History from "@/components/history.tsx";
import NowPlaying from "@/components/nowPlaying.tsx";
import Queue from "@/components/queue.tsx";
import QueueClosedBanner from "@/components/queueClosedBanner.tsx";
import SearchBar from "@/components/searchBar.tsx";
import ConfirmPopup from "@/components/confirmPopup.tsx";
import Card from "@/components/ui/card.tsx";
import {
	MOCK_QUEUE_CLOSED,
	PLAYBACK_QUEUE_ID,
	REQUEST_QUEUE_NAME,
} from "@/constants.ts";

import { colors, fontSizes, fontWeights, radius, space } from "../vars.stylex.ts";

const NARROW = "@media (max-width: 639px)";

const styles = stylex.create({
	root: {
		display: "flex",
		flexDirection: "column",
		gap: space.md,
	},
	// A kiosk is read from across the room, so the join code is always on
	// screen rather than hidden behind a button nobody walks over to press.
	hero: {
		display: "flex",
		flexDirection: { default: "row", [NARROW]: "column" },
		alignItems: "center",
		justifyContent: "space-between",
		gap: space.md,
	},
	heroText: {
		display: "flex",
		flexDirection: "column",
		gap: space.xs,
		minWidth: 0,
	},
	heroTitle: {
		color: colors.primaryText,
		fontSize: { default: fontSizes.lg, [NARROW]: fontSizes.md },
		fontWeight: fontWeights.bold,
		margin: 0,
	},
	heroSubtitle: {
		display: "flex",
		alignItems: "center",
		gap: space.xs,
		color: colors.secondaryText,
		fontSize: fontSizes.sm,
		margin: 0,
	},
	joinUrl: {
		color: colors.accent,
		fontSize: fontSizes.xs,
		fontWeight: fontWeights.semibold,
		wordBreak: "break-all",
	},
	// The code keeps its own light plate and quiet zone; scanners need the
	// contrast, and in dark mode the card behind it is nearly black.
	qrPlate: {
		display: "flex",
		flexShrink: 0,
		borderRadius: radius.md,
		backgroundColor: "#ffffff",
		padding: space.md,
		lineHeight: 0,
	},
});

function JoinHero() {
	const joinUrl = `${window.location.origin}/`;
	const joinLabel = joinUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");

	return (
		<Card>
			<div {...stylex.props(styles.hero)}>
				<div {...stylex.props(styles.heroText)}>
					<h1 {...stylex.props(styles.heroTitle)}>Request your favorite songs</h1>
					<p {...stylex.props(styles.heroSubtitle)}>
						<Smartphone size={16} />
						Scan the code to add a song from your phone
					</p>
					<span {...stylex.props(styles.joinUrl)}>{joinLabel}</span>
				</div>

				<div {...stylex.props(styles.qrPlate)}>
					{/* The spec asks for a 4-module quiet zone. Two modules sit
					    inside the SVG, the white plate's padding supplies the rest,
					    which keeps the code itself as large as possible at this size. */}
					<QRCodeSVG
						value={joinUrl}
						size={132}
						level="M"
						marginSize={2}
						bgColor="#ffffff"
						fgColor="#000000"
					/>
				</div>
			</div>
		</Card>
	);
}

export default function Kiosk() {
	// A guest at the kiosk has no session, so there is no "your requests" list
	// and no way to take a song back out. Confirm before it goes in.
	const pendingLink = useSignal<string | null>(null);

	return (
		<div {...stylex.props(styles.root)}>
			<JoinHero />

			{MOCK_QUEUE_CLOSED ? (
				<QueueClosedBanner />
			) : (
				<SearchBar onSelect={(link) => (pendingLink.value = link)} />
			)}

			<ConfirmPopup
				open={pendingLink.value != null}
				message="Add this song to the queue? You can't take it back from the kiosk afterwards."
				onCancel={() => (pendingLink.value = null)}
				onConfirm={() => {
					const link = pendingLink.value;
					pendingLink.value = null;
					// No session on a kiosk, so the request stays anonymous.
					if (link) void requestSong(link);
				}}
			/>

			<NowPlaying />

			{queues.value.map((queue) =>
				queue.value.id !== PLAYBACK_QUEUE_ID ? (
					<Queue
						key={queue.value.id}
						queue={queue}
						showVoteButtons={queue.value.name === REQUEST_QUEUE_NAME}
					/>
				) : null,
			)}

			<History />
			<Footer />
		</div>
	);
}

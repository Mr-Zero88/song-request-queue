import { QRCodeSVG } from "qrcode.react";
import * as stylex from "@stylexjs/stylex";
import { useSignal } from "@preact/signals-react";

import { requestSong } from "@/requestSong.ts";
import ConfirmPopup from "@/components/confirmPopup.tsx";
import PageHeader from "@/components/pageHeader.tsx";
import QueueBoard from "@/components/queueBoard.tsx";
import Button from "@/components/ui/button.tsx";
import Modal from "@/components/ui/modal.tsx";

import { colors, fontSizes, fontWeights, radius, space } from "../vars.stylex.ts";

const styles = stylex.create({
	// A thumbnail, not a scan target: it only has to be big enough to recognise
	// and tap.
	qrButton: {
		display: "flex",
		flexShrink: 0,
		padding: 0,
		borderStyle: "none",
		backgroundColor: "transparent",
		lineHeight: 0,
		cursor: "pointer",
		borderRadius: radius.sm,
	},
	// Enlarged, the code needs its own light plate and quiet zone — scanners
	// need the contrast, and in dark mode the panel is nearly black.
	qrPlate: {
		display: "flex",
		justifyContent: "center",
		borderRadius: radius.md,
		backgroundColor: "#ffffff",
		padding: space.md,
		lineHeight: 0,
	},
	dialog: {
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		gap: space.md,
	},
	dialogUrl: {
		color: colors.primaryText,
		fontSize: fontSizes.sm,
		fontWeight: fontWeights.semibold,
		wordBreak: "break-all",
		textAlign: "center",
	},
});

function JoinCode() {
	const joinUrl = `${window.location.origin}/`;
	const joinLabel = joinUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");
	const enlarged = useSignal(false);

	return (
		<>
			<PageHeader
				title="Hey, request your favorite songs!"
				subtitle={joinLabel}
				action={
					<button
						type="button"
						aria-label="Enlarge the join code"
						onClick={() => (enlarged.value = true)}
						{...stylex.props(styles.qrButton)}
					>
						<QRCodeSVG
							value={joinUrl}
							size={64}
							level="M"
							marginSize={0}
							bgColor="transparent"
							fgColor={colors.primaryText}
						/>
					</button>
				}
			/>

			<Modal open={enlarged.value} onClose={() => (enlarged.value = false)}>
				<div {...stylex.props(styles.dialog)}>
					<div {...stylex.props(styles.qrPlate)}>
						{/* The spec asks for a 4-module quiet zone. Two modules sit
						    inside the SVG, the white plate's padding supplies the rest. */}
						<QRCodeSVG
							value={joinUrl}
							size={240}
							level="M"
							marginSize={2}
							bgColor="#ffffff"
							fgColor="#000000"
						/>
					</div>
					<span {...stylex.props(styles.dialogUrl)}>{joinLabel}</span>
					<Button
						variant="secondary"
						size="sm"
						onClick={() => (enlarged.value = false)}
					>
						Close
					</Button>
				</div>
			</Modal>
		</>
	);
}

export default function Kiosk() {
	// A guest at the kiosk has no session, so there is no way to take a song
	// back out afterwards. Confirm before it goes in.
	const pendingLink = useSignal<string | null>(null);

	return (
		<>
			<QueueBoard
				header={<JoinCode />}
				onSelectSong={(link) => (pendingLink.value = link)}
			/>

			<ConfirmPopup
				open={pendingLink.value != null}
				message="Add this song to the queue? You can't take it back from the kiosk afterwards."
				onCancel={() => (pendingLink.value = null)}
				onConfirm={() => {
					const link = pendingLink.value;
					pendingLink.value = null;
					if (link) void requestSong(link);
				}}
			/>
		</>
	);
}

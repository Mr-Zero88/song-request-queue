import {
	addToQueue,
	deleteSession,
	queues,
	removeFromQueue,
	session,
} from "@/api/api.ts";
import SearchBar from "@/components/searchBar.tsx";
import Queue from "@/components/queue.tsx";
import NowPlaying from "@/components/nowPlaying.tsx";
import History from "@/components/history.tsx";
import Footer from "@/components/footer.tsx";
import Button from "@/components/ui/button.tsx";
import Card from "@/components/ui/card.tsx";
import YoutubeThumbnail from "@/components/youtubeThumbnail.tsx";
import QueueClosedBanner from "@/components/queueClosedBanner.tsx";
import ConfirmPopup from "@/components/confirmPopup.tsx";
import { useVideoMetadata } from "@/hooks/useVideoMetadata.ts";
import { useSignal } from "@preact/signals-react";
import { MOCK_QUEUE_CLOSED, PLAYBACK_QUEUE_ID, REQUEST_QUEUE_NAME } from "@/constants.ts";
import * as stylex from "@stylexjs/stylex";
import { signal } from "@preact/signals-react";
import { AlertCircle, Heart, LogOut, Trash2 } from "lucide-react";

import { colors, fontSizes, fontWeights, space } from "../vars.stylex.ts";

import type { Role } from "song-request-queue-common/types/session";
import type { QueueItem } from "song-request-queue-common/types/queue";

type QueueViewProps = {
	role: Role;
};

const LG = "@media (min-width: 1024px)";
const NARROW = "@media (max-width: 639px)";

const styles = stylex.create({
	header: {
		display: "flex",
		justifyContent: "space-between",
		alignItems: "center",
		gap: space.md,
		marginBottom: space.md,
	},
	greeting: {
		color: colors.primaryText,
		fontSize: { default: fontSizes.lg, [NARROW]: fontSizes.md },
		fontWeight: fontWeights.semibold,
		minWidth: 0,
		overflow: "hidden",
		textOverflow: "ellipsis",
	},
	// Without this the label breaks into "Log / out" on a narrow screen.
	headerAction: {
		flexShrink: 0,
	},
	adminHeader: {
		display: "flex",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: space.lg,
		paddingBottom: space.md,
		borderBottomStyle: "solid",
		borderBottomWidth: "1px",
		borderBottomColor: colors.border,
	},
	adminTitle: {
		color: colors.primaryText,
		fontSize: fontSizes.xxl,
		fontWeight: fontWeights.bold,
	},
	adminSearchRow: {
		maxWidth: "40rem",
		marginBottom: space.lg,
	},
	adminGrid: {
		display: "grid",
		gridTemplateColumns: { default: "1fr", [LG]: "1.2fr 1fr 1fr" },
		gap: space.lg,
		alignItems: "stretch",
	},
	column: {
		display: "flex",
		flexDirection: "column",
		gap: space.md,
		minWidth: 0,
	},
	ownRequestsTitle: {
		display: "flex",
		alignItems: "center",
		gap: space.xs,
		color: colors.primaryText,
		fontSize: fontSizes.lg,
		fontWeight: fontWeights.semibold,
		marginTop: 0,
		marginBottom: space.sm,
	},
	ownRequestRow: {
		display: "flex",
		gap: space.md,
		alignItems: "center",
	},
	ownRequestAction: {
		marginLeft: "auto",
		flexShrink: 0,
	},
	ownRequestDesc: {
		display: "flex",
		flexDirection: "column",
		gap: space.xs,
		minWidth: 0,
	},
	ownRequestTitle: {
		color: colors.primaryText,
		fontSize: fontSizes.md,
		fontWeight: fontWeights.semibold,
	},
	ownRequestAuthor: {
		color: colors.secondaryText,
		fontSize: fontSizes.sm,
	},
	ownRequestPosition: {
		color: colors.accent,
		fontSize: fontSizes.sm,
		fontWeight: fontWeights.semibold,
	},
	errorRow: {
		display: "flex",
		alignItems: "center",
		gap: space.sm,
	},
	errorIcon: {
		color: colors.danger,
		flexShrink: 0,
	},
	errorText: {
		flex: 1,
		minWidth: 0,
		color: colors.primaryText,
		fontSize: fontSizes.sm,
	},
});

// Both actions below are fired without the caller awaiting them, so a failure
// has nowhere else to go — the UI would otherwise look identical to success.
const actionError = signal<string | null>(null);

function ActionError() {
	if (actionError.value == null) return null;

	return (
		<Card>
			<div {...stylex.props(styles.errorRow)}>
				<AlertCircle size={16} {...stylex.props(styles.errorIcon)} />
				<span {...stylex.props(styles.errorText)}>{actionError.value}</span>
				<Button
					variant="ghost"
					size="sm"
					onClick={() => (actionError.value = null)}
				>
					Dismiss
				</Button>
			</div>
		</Card>
	);
}

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
	const error = await addToQueue(
		requestQueue.value.id,
		link,
		session.value?.username,
	);
	if (error) {
		actionError.value = error.message;
	}
};

const handleLogout = async () => {
	const error = await deleteSession();
	if (error) {
		// The server-side session and its httpOnly cookie are still alive, so
		// clearing `session` here would only log the user straight back in on the
		// next reload. Keep them signed in and say what happened instead.
		actionError.value = `${error.message} — you are still signed in.`;
		return;
	}

	actionError.value = null;
	session.value = null;
};

type OwnRequestRowProps = {
	song: QueueItem;
	position: number;
	aheadCount: number;
	queueId: string;
};

function OwnRequestRow({
	song,
	position,
	aheadCount,
	queueId,
}: OwnRequestRowProps) {
	const metadata = useVideoMetadata(song.link);
	const confirming = useSignal(false);
	const isWithdrawing = useSignal(false);

	const withdraw = async () => {
		if (isWithdrawing.value) return;

		isWithdrawing.value = true;
		try {
			const error = await removeFromQueue(queueId, song.link);
			actionError.value = error ? error.message : null;
		} finally {
			isWithdrawing.value = false;
		}
	};

	return (
		<div {...stylex.props(styles.ownRequestRow)}>
			<YoutubeThumbnail
				youtubeURL={song.link}
				alt={metadata.value?.title ?? "Video thumbnail"}
			/>
			<div {...stylex.props(styles.ownRequestDesc)}>
				<span {...stylex.props(styles.ownRequestTitle)}>
					{metadata.value?.title}
				</span>
				<span {...stylex.props(styles.ownRequestAuthor)}>
					{metadata.value?.author_name}
				</span>
				<span {...stylex.props(styles.ownRequestPosition)}>
					Position #{position} ·{" "}
					{aheadCount === 0
						? "You're next!"
						: `${aheadCount} song${aheadCount > 1 ? "s" : ""} ahead of you`}
				</span>
			</div>

			<div {...stylex.props(styles.ownRequestAction)}>
				<Button
					variant="ghost"
					size="sm"
					aria-label="Withdraw this request"
					disabled={isWithdrawing.value}
					onClick={() => (confirming.value = true)}
				>
					<Trash2 size={14} />
					{isWithdrawing.value ? "Removing..." : "Withdraw"}
				</Button>
			</div>

			<ConfirmPopup
				open={confirming.value}
				message="Take this song back out of the queue?"
				onCancel={() => (confirming.value = false)}
				onConfirm={() => {
					confirming.value = false;
					void withdraw();
				}}
			/>
		</div>
	);
}

function OwnRequestsSummary() {
	const username = session.value?.username;
	const requestQueue = queues.value.find(
		(q) => q.value.name === REQUEST_QUEUE_NAME,
	);
	if (!username || !requestQueue) return null;

	const ownSongs = requestQueue.value.songs
		.map((song, index) => ({ song, index }))
		.filter(({ song }) => song.requestedBy === username);
	if (ownSongs.length === 0) return null;

	return (
		<Card>
			<h3 {...stylex.props(styles.ownRequestsTitle)}>
				<Heart size={16} />
				Your Requests
			</h3>
			{ownSongs.map(({ song, index }) => (
				<OwnRequestRow
					key={song.id}
					song={song}
					position={index + 1}
					aheadCount={index}
					queueId={requestQueue.value.id}
				/>
			))}
		</Card>
	);
}

export default function QueueView({ role }: QueueViewProps) {
	const isAdmin = role === "admin";

	const playbackQueue = queues.value.find(
		(queue) => queue.value.id === PLAYBACK_QUEUE_ID,
	);
	const requestQueue = queues.value.find(
		(queue) => queue.value.name === REQUEST_QUEUE_NAME,
	);

	const header = (
		<div {...stylex.props(styles.header)}>
			<span {...stylex.props(styles.greeting)}>
				Hey {session.value?.username}, request your favorite songs!
			</span>
			<div {...stylex.props(styles.headerAction)}>
				<Button variant="ghost" size="sm" onClick={() => void handleLogout()}>
					<LogOut size={14} />
					Log out
				</Button>
			</div>
		</div>
	);

	if (isAdmin) {
		return (
			<>
				<div {...stylex.props(styles.adminHeader)}>
					<span {...stylex.props(styles.adminTitle)}>DJ Console</span>
					<Button variant="ghost" size="sm" onClick={() => void handleLogout()}>
						Log out
					</Button>
				</div>

				<ActionError />

				<div {...stylex.props(styles.adminSearchRow)}>
					<SearchBar onSelect={(link) => void requestLink(link)} />
				</div>

				<div {...stylex.props(styles.adminGrid)}>
					<div {...stylex.props(styles.column)}>
						<NowPlaying hero />
					</div>
					<div {...stylex.props(styles.column)}>
						{playbackQueue ? (
							<Queue
								queue={playbackQueue}
								title="Playback Queue"
								showRemoveButton
							/>
						) : null}
					</div>
					<div {...stylex.props(styles.column)}>
						{requestQueue ? (
							<Queue
								queue={requestQueue}
								showMoveToPlaybackButton
								showRemoveButton
								showVoteButtons
							/>
						) : null}
					</div>
				</div>
			</>
		);
	}

	return (
		<>
			{header}
			<ActionError />
			{MOCK_QUEUE_CLOSED ? (
				<QueueClosedBanner />
			) : (
				<SearchBar onSelect={(link) => void requestLink(link)} />
			)}
			<NowPlaying />
			<OwnRequestsSummary />

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
		</>
	);
}

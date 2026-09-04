import {
	addToQueue,
	displayName,
	queues,
	removeFromQueue,
	voterName,
	voteOnSong,
} from "@/api/api.ts";
import { useVideoMetadata } from "@/hooks/useVideoMetadata.ts";
import { useSignal, type Signal } from "@preact/signals-react";
import * as stylex from "@stylexjs/stylex";
import { ArrowBigDown, ArrowBigUp, ListMusic, Trash2, type LucideIcon } from "lucide-react";

import { colors, fontSizes, fontWeights, radius, space } from "../vars.stylex.ts";
import { PLAYBACK_QUEUE_ID } from "../constants.ts";
import { UNKNOWN_DURATION } from "@/utils/duration.ts";

import Button from "@/components/ui/button.tsx";
import Card from "@/components/ui/card.tsx";
import EmptyState from "@/components/ui/emptyState.tsx";
import LoadingSpinner from "@/components/ui/loadingSpinner.tsx";
import ConfirmPopup from "@/components/confirmPopup.tsx";

import type { Queue, QueueItem } from "song-request-queue-common/types/queue";

const NARROW = "@media (max-width: 639px)";

// Shared column widths so the header row and every song row line up exactly.
// Only the last (actions) column is content-sized — since it's last, its
// width never shifts the position/song/added-by/voting columns before it.
const GRID_TEMPLATE = "2rem minmax(0, 1fr) 8.5rem 6rem 3.5rem auto";

// On a phone the added-by and time columns collapse into the meta line under
// the title, leaving just position / song / voting on one row.
const GRID_TEMPLATE_NARROW = "1.5rem minmax(0, 1fr) auto";

const styles = stylex.create({
	root: {
		listStyleType: "none",
		display: "flex",
		flexDirection: "column",
		gap: 0,
		marginTop: space.lg,
		marginBottom: 0,
		padding: 0,
	},
	queueTitle: {
		display: "flex",
		alignItems: "center",
		gap: space.xs,
		color: colors.primaryText,
		fontSize: fontSizes.lg,
		fontWeight: fontWeights.semibold,
		marginTop: 0,
		marginBottom: space.sm,
	},

	listHeader: {
		display: { default: "grid", [NARROW]: "none" },
		gridTemplateColumns: GRID_TEMPLATE,
		alignItems: "center",
		gap: space.md,
		paddingBottom: space.xs,
		borderBottomStyle: "solid",
		borderBottomWidth: "1px",
		borderBottomColor: colors.border,
	},
	headerCell: {
		color: colors.secondaryText,
		fontSize: fontSizes.xs,
		fontWeight: fontWeights.semibold,
		textTransform: "uppercase",
	},
	headerPosition: {
		textAlign: "center",
	},
	headerVoting: {
		textAlign: "center",
	},
	headerTime: {
		textAlign: "center",
	},

	queueElement: {
		display: "grid",
		gridTemplateColumns: { default: GRID_TEMPLATE, [NARROW]: GRID_TEMPLATE_NARROW },
		alignItems: "center",
		gap: { default: space.md, [NARROW]: space.sm },
		padding: { default: `${space.xs} 0`, [NARROW]: `${space.sm} 0` },
		borderBottomStyle: "solid",
		borderBottomWidth: "1px",
		borderBottomColor: colors.border,
		":last-child": {
			borderBottomWidth: 0,
		},
	},
	position: {
		color: colors.secondaryText,
		fontSize: fontSizes.xs,
		fontWeight: fontWeights.semibold,
		textAlign: "center",
		flexShrink: 0,
	},
	song: {
		display: "flex",
		flexDirection: "column",
		justifyContent: "center",
		gap: 0,
		minWidth: 0,
	},
	songTitle: {
		color: colors.primaryText,
		fontSize: fontSizes.sm,
		fontWeight: fontWeights.semibold,
		// Long titles otherwise push the row to four or five lines on a phone.
		display: { default: "block", [NARROW]: "-webkit-box" },
		WebkitBoxOrient: "vertical",
		WebkitLineClamp: { default: "none", [NARROW]: 2 },
		overflow: { default: "visible", [NARROW]: "hidden" },
	},
	// Added-by and time live in their own grid columns on a wide screen; on a
	// phone they ride along in the meta line instead of costing a row each.
	metaExtra: {
		display: { default: "none", [NARROW]: "inline" },
	},
	songAuthor: {
		color: colors.secondaryText,
		fontSize: fontSizes.xs,
		margin: 0,
	},
	addedBy: {
		display: { default: "flex", [NARROW]: "none" },
		alignItems: "center",
		color: colors.secondaryText,
		fontSize: fontSizes.xs,
		minWidth: 0,
	},
	addedByOwn: {
		color: colors.accent,
		fontWeight: fontWeights.semibold,
	},
	voting: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		flexWrap: "wrap",
		gap: space.xs,
	},
	voteButton: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		width: "1.75rem",
		height: "1.75rem",
		borderStyle: "none",
		borderRadius: radius.sm,
		backgroundColor: "transparent",
		cursor: "pointer",
	},
	voteButtonUp: {
		color: colors.success,
	},
	voteButtonDown: {
		color: colors.danger,
	},
	voteCount: {
		color: colors.secondaryText,
		fontSize: fontSizes.sm,
		fontWeight: fontWeights.semibold,
		minWidth: "1.25rem",
		textAlign: "center",
	},
	voteError: {
		color: colors.danger,
		fontSize: fontSizes.xs,
		flexBasis: "100%",
		textAlign: "center",
	},
	voteCountPositive: {
		color: colors.success,
	},
	voteCountNegative: {
		color: colors.danger,
	},
	time: {
		display: { default: "flex", [NARROW]: "none" },
		alignItems: "center",
		justifyContent: "center",
		color: colors.secondaryText,
		fontSize: fontSizes.xs,
		fontVariantNumeric: "tabular-nums",
	},
	actions: {
		display: "flex",
		gap: space.sm,
		flexShrink: 0,
		gridColumn: { default: "auto", [NARROW]: "1 / -1" },
	},
	actionButton: {
		flex: { default: "initial", [NARROW]: 1 },
	},
	// Keeps the desktop grid columns aligned when a row has no voting or
	// actions; on a phone those columns don't exist, so it takes no space.
	gridSpacer: {
		display: { default: "block", [NARROW]: "none" },
	},
});

type QueueProps = React.HTMLAttributes<HTMLDivElement> & {
	queue: Signal<Queue>;
	showMoveToPlaybackButton?: boolean;
	showRemoveButton?: boolean;
	showVoteButtons?: boolean;
	showVoteCount?: boolean;
	title?: string;
	titleIcon?: LucideIcon;
	songs?: QueueItem[];
	emptyMessage?: string;
};

type QueueSongItemProps = {
	element: QueueItem;
	position: number;
	onMoveToPlayback?: (element: QueueItem) => Promise<Error | null | undefined>;
	onRemove?: (element: QueueItem) => Promise<Error | null>;
	onVote?: (element: QueueItem, direction: "up" | "down") => Promise<Error | null>;
	showVoteCount?: boolean;
};

function QueueSongItem({
	element,
	position,
	onMoveToPlayback,
	onRemove,
	onVote,
	showVoteCount,
}: QueueSongItemProps) {
	const metadata = useVideoMetadata(element.link);
	const isMoving = useSignal(false);
	const isRemoving = useSignal(false);
	const isVoting = useSignal(false);
	const voteError = useSignal<string | null>(null);
	const confirmingRemove = useSignal(false);
	const username = displayName();
	// Attribution and voting identity differ on the kiosk: requests made there
	// are anonymous, but votes still need someone to hang on.
	const voter = voterName();
	const isOwnRequest =
		element.requestedBy != null && element.requestedBy === username;
	const addedByLabel = isOwnRequest ? "You" : (element.requestedBy ?? null);
	const netVotes = (element.upvotes?.length ?? 0) - (element.downvotes?.length ?? 0);
	// No duration source is wired up, so the column shows a dash rather than a
	// number the guest would read as real.
	const durationLabel: string | null = null;
	const voteCountStyle =
		netVotes > 0
			? styles.voteCountPositive
			: netVotes < 0
				? styles.voteCountNegative
				: null;
	const userVote: "up" | "down" | null =
		voter && element.upvotes?.includes(voter)
			? "up"
			: voter && element.downvotes?.includes(voter)
				? "down"
				: null;

	const handleVote = async (direction: "up" | "down") => {
		if (!onVote || !voter || isVoting.value) return;

		isVoting.value = true;
		voteError.value = null;
		try {
			// A rejected vote otherwise looks exactly like a slow poll: the arrow
			// simply never fills in and the user keeps tapping.
			const error = await onVote(element, direction);
			voteError.value = error ? error.message : null;
		} finally {
			isVoting.value = false;
		}
	};

	const handleMoveToPlayback = async () => {
		if (!onMoveToPlayback || isMoving.value) {
			return;
		}

		isMoving.value = true;
		try {
			await onMoveToPlayback(element);
		} finally {
			isMoving.value = false;
		}
	};

	const handleRemove = async () => {
		if (!onRemove || isRemoving.value) {
			return;
		}

		isRemoving.value = true;
		try {
			await onRemove(element);
		} finally {
			isRemoving.value = false;
		}
	};

	return (
		<li {...stylex.props(styles.queueElement)}>
			<span {...stylex.props(styles.position)}>{position}</span>

			<div {...stylex.props(styles.song)}>
				<a
					{...stylex.props(styles.songTitle)}
					href={element.link}
					target="_blank"
					rel="noopener noreferrer"
				>
					{metadata.value?.title ?? <LoadingSpinner size={14} />}
				</a>
				<p {...stylex.props(styles.songAuthor)}>
					{metadata.value?.author_name}
					<span {...stylex.props(styles.metaExtra)}>
						{addedByLabel ? ` \u00b7 ${addedByLabel}` : ""}
						{durationLabel ? ` \u00b7 ${durationLabel}` : ""}
					</span>
				</p>
			</div>

			<span
				{...stylex.props(styles.addedBy, isOwnRequest ? styles.addedByOwn : null)}
			>
				{addedByLabel}
			</span>

			{onVote ? (
				<div {...stylex.props(styles.voting)}>
					<button
						type="button"
						aria-label="Upvote"
						aria-pressed={userVote === "up"}
						disabled={isVoting.value}
						onClick={() => void handleVote("up")}
						{...stylex.props(styles.voteButton, styles.voteButtonUp)}
					>
						<ArrowBigUp size={18} fill={userVote === "up" ? "currentColor" : "none"} />
					</button>
					<span {...stylex.props(styles.voteCount, voteCountStyle)}>{netVotes}</span>
					<button
						type="button"
						aria-label="Downvote"
						aria-pressed={userVote === "down"}
						disabled={isVoting.value}
						onClick={() => void handleVote("down")}
						{...stylex.props(styles.voteButton, styles.voteButtonDown)}
					>
						<ArrowBigDown size={18} fill={userVote === "down" ? "currentColor" : "none"} />
					</button>
					{voteError.value ? (
						<span role="alert" {...stylex.props(styles.voteError)}>
							{voteError.value}
						</span>
					) : null}
				</div>
			) : showVoteCount ? (
				<div {...stylex.props(styles.voting)}>
					<span {...stylex.props(styles.voteCount, voteCountStyle)}>{netVotes}</span>
				</div>
			) : (
				<span {...stylex.props(styles.gridSpacer)} />
			)}

			<span {...stylex.props(styles.time)}>{durationLabel ?? UNKNOWN_DURATION}</span>

			{onMoveToPlayback || onRemove ? (
				<div {...stylex.props(styles.actions)}>
					{onMoveToPlayback ? (
						<div {...stylex.props(styles.actionButton)}>
							<Button
								variant="primary"
								size="sm"
								disabled={isMoving.value || isRemoving.value}
								onClick={() => void handleMoveToPlayback()}
							>
								<ListMusic size={14} />
								{isMoving.value ? "Adding..." : "Move to Playback"}
							</Button>
						</div>
					) : null}
					{onRemove ? (
						<div {...stylex.props(styles.actionButton)}>
							<Button
								variant="danger"
								size="sm"
								disabled={isMoving.value || isRemoving.value}
								onClick={() => (confirmingRemove.value = true)}
							>
								<Trash2 size={14} />
								{isRemoving.value ? "Removing..." : "Remove"}
							</Button>
						</div>
					) : null}
				</div>
			) : (
				<span {...stylex.props(styles.gridSpacer)} />
			)}

			<ConfirmPopup
				open={confirmingRemove.value}
				message="Remove this song from the queue?"
				onCancel={() => (confirmingRemove.value = false)}
				onConfirm={() => {
					confirmingRemove.value = false;
					void handleRemove();
				}}
			/>
		</li>
	);
}

export default function Queue({
	queue,
	showMoveToPlaybackButton = false,
	showRemoveButton = false,
	showVoteButtons = false,
	showVoteCount = false,
	title,
	titleIcon: TitleIcon = ListMusic,
	songs,
	emptyMessage = "No songs in this queue yet.",
	...rest
}: QueueProps) {
	const displayedSongs = songs ?? queue.value.songs;
	const playbackQueue = queues.value.find(
		(candidate) => candidate.value.id === PLAYBACK_QUEUE_ID,
	);
	const onMoveToPlayback =
		showMoveToPlaybackButton &&
		playbackQueue &&
		queue.value.id !== PLAYBACK_QUEUE_ID
			? async (element: QueueItem) => {
					const addError = await addToQueue(
						playbackQueue.value.id,
						element.link,
						element.requestedBy,
					);
					if (addError) {
						console.error(`Error while moving song to playback queue: ${addError.message}`);
						return addError;
					}
					const removeError = await removeFromQueue(queue.value.id, element.link);
					if (removeError) {
						console.error(`Error while removing song from request queue: ${removeError.message}`);
						return removeError;
					}
				}
			: undefined;
	const onRemove = showRemoveButton
		? async (element: QueueItem) => removeFromQueue(queue.value.id, element.link)
		: undefined;
	const onVote = showVoteButtons
		? async (element: QueueItem, direction: "up" | "down") =>
				voteOnSong(queue.value.id, element.link, direction)
		: undefined;

	return (
		<Card {...rest}>
			<h3 {...stylex.props(styles.queueTitle)}>
				<TitleIcon size={18} />
				{title ?? queue.value.name}
			</h3>
			{displayedSongs.length === 0 ? (
				<EmptyState>{emptyMessage}</EmptyState>
			) : (
				<div {...stylex.props(styles.listHeader)}>
					<span {...stylex.props(styles.headerCell, styles.headerPosition)}>#</span>
					<span {...stylex.props(styles.headerCell)}>Song</span>
					<span {...stylex.props(styles.headerCell)}>Added By</span>
					<span {...stylex.props(styles.headerCell, styles.headerVoting)}>Voting</span>
					<span {...stylex.props(styles.headerCell, styles.headerTime)}>Time</span>
					<span />
				</div>
			)}
			<ol {...stylex.props(styles.root)}>
				{displayedSongs.map((element, index) => (
					<QueueSongItem
						key={element.id}
						element={element}
						position={index + 1}
						onMoveToPlayback={onMoveToPlayback}
						onRemove={onRemove}
						onVote={onVote}
						showVoteCount={showVoteCount}
					/>
				))}
			</ol>
		</Card>
	);
}

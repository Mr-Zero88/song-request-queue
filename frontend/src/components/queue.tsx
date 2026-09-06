import { media } from "../breakpoints.stylex.ts";
import {
	addToQueue,
	displayName,
	queues,
	removeFromQueue,
	voterName,
	voteOnSong,
} from "@/api/api.ts";
import { netVotes, requesterLabel } from "@/utils/song.ts";
import { useVideoMetadata } from "@/hooks/useVideoMetadata.ts";
import { useVoteCooldown } from "@/hooks/useVoteCooldown.ts";
import { notify } from "@/components/ui/toast.tsx";
import { useSignal, type Signal } from "@preact/signals-react";
import * as stylex from "@stylexjs/stylex";
import { ArrowBigDown, ArrowBigUp, ListMusic, Trash2, type LucideIcon } from "lucide-react";

import { colors, fontSizes, fontWeights, radius, space } from "../vars.stylex.ts";
import { PLAYBACK_QUEUE_ID } from "../constants.ts";

import Button from "@/components/ui/button.tsx";
import Card from "@/components/ui/card.tsx";
import EmptyState from "@/components/ui/emptyState.tsx";
import LoadingSpinner from "@/components/ui/loadingSpinner.tsx";
import VoteCount from "@/components/ui/voteCount.tsx";
import ConfirmPopup from "@/components/confirmPopup.tsx";

import type { Queue, QueueItem } from "song-request-queue-common/types/queue";

/**
 * How much room the row's buttons get. A table picks one width for all of its
 * rows: each row is its own grid, so a content-sized action column would be
 * measured per row and shift every column before it out of line.
 */
type ActionColumn = "none" | "remove" | "moveAndRemove";

// The header row and every song row share these tracks so the columns line up.
// The fixed ones stay small: the DJ console puts two of these tables side by
// side, so the whole grid has to fit in about half a screen.
const columns = "2rem minmax(0, 1fr) 6rem 6rem";
// On a phone added-by moves into the meta line under the title, leaving
// position / song / voting.
const narrowColumns = "1.5rem minmax(0, 1fr) auto";

const styles = stylex.create({
	list: {
		listStyleType: "none",
		display: "flex",
		flexDirection: "column",
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
		display: { default: "grid", [media.narrow]: "none" },
		alignItems: "center",
		gap: space.md,
		paddingBottom: space.xs,
		borderBottomStyle: "solid",
		borderBottomWidth: "1px",
		borderBottomColor: colors.border,
	},
	gridNone: {
		gridTemplateColumns: { default: columns, [media.narrow]: narrowColumns },
	},
	// A withdraw is one icon wide, so on a phone it fits beside the voting
	// arrows rather than claiming a line of its own.
	gridRemove: {
		gridTemplateColumns: {
			default: `${columns} 6rem`,
			[media.narrow]: `${narrowColumns} 2rem`,
		},
	},
	// "Move to Playback" keeps its label; the remove beside it is icon-only so
	// the pair still fits a console column. On a phone they have nowhere to go
	// but their own line beneath the row.
	gridMoveAndRemove: {
		gridTemplateColumns: {
			default: `${columns} 13rem`,
			[media.narrow]: narrowColumns,
		},
	},

	headerCell: {
		color: colors.secondaryText,
		fontSize: fontSizes.xs,
		fontWeight: fontWeights.semibold,
		textTransform: "uppercase",
	},
	headerCentered: {
		textAlign: "center",
	},

	row: {
		display: "grid",
		alignItems: "center",
		gap: { default: space.md, [media.narrow]: space.sm },
		padding: { default: `${space.xs} 0`, [media.narrow]: `${space.sm} 0` },
		// A row with a button is as tall as that button, and on a phone a
		// two-line title is taller than a one-line one. Keeps rows even.
		minHeight: { default: "3rem", [media.narrow]: "4.5rem" },
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
	},
	song: {
		display: "flex",
		flexDirection: "column",
		justifyContent: "center",
		minWidth: 0,
	},
	songTitle: {
		color: colors.primaryText,
		fontSize: fontSizes.sm,
		fontWeight: fontWeights.semibold,
		// One line on a desktop so a long title can't outgrow its row; two on a
		// phone, where one would cut most titles in half. The full text stays
		// reachable through the link's tooltip.
		display: "-webkit-box",
		WebkitBoxOrient: "vertical",
		WebkitLineClamp: { default: 1, [media.narrow]: 2 },
		overflow: "hidden",
	},
	meta: {
		display: "flex",
		gap: space.xs,
		minWidth: 0,
		color: colors.secondaryText,
		fontSize: fontSizes.xs,
		margin: 0,
	},
	// The channel gives way first: on a narrow screen the requester matters more
	// and would otherwise be the part that gets cut.
	metaAuthor: {
		minWidth: 0,
		overflow: "hidden",
		textOverflow: "ellipsis",
		whiteSpace: "nowrap",
	},
	// Added-by has its own column on a wide screen; on a phone it rides along in
	// the meta line instead of costing a row.
	metaRequester: {
		display: { default: "none", [media.narrow]: "block" },
		flexShrink: 0,
		maxWidth: "50%",
		overflow: "hidden",
		textOverflow: "ellipsis",
		whiteSpace: "nowrap",
	},
	addedBy: {
		display: { default: "block", [media.narrow]: "none" },
		color: colors.secondaryText,
		fontSize: fontSizes.xs,
		minWidth: 0,
		overflow: "hidden",
		textOverflow: "ellipsis",
		whiteSpace: "nowrap",
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
		":disabled": {
			opacity: 0.4,
			cursor: "not-allowed",
		},
	},
	voteUp: {
		color: colors.success,
	},
	voteDown: {
		color: colors.danger,
	},
	voteCooldown: {
		color: colors.secondaryText,
		fontSize: fontSizes.xs,
		flexBasis: "100%",
		textAlign: "center",
		fontVariantNumeric: "tabular-nums",
	},

	actions: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		gap: space.sm,
		minWidth: 0,
	},
	actionsFullWidth: {
		gridColumn: { default: "auto", [media.narrow]: "1 / -1" },
	},
	actionButton: {
		flex: { default: "initial", [media.narrow]: 1 },
		minWidth: 0,
	},
	// A withdraw on its own sits in a 6rem column, so it drops the filled danger
	// block for a quiet outline and lets the icon carry the shape.
	withdrawButton: {
		paddingInline: space.xs,
		fontSize: fontSizes.xs,
		minHeight: "2rem",
		// Icon-only on a phone, where the column is a thumb wide.
		width: { default: "auto", [media.narrow]: "2rem" },
	},
	withdrawLabel: {
		display: { default: "inline", [media.narrow]: "none" },
	},
	// Beside "Move to Playback" it is the other way round: no room for a label
	// in the shared column, but plenty on the phone's full-width action line.
	removeButton: {
		paddingInline: space.xs,
		minHeight: "2rem",
		width: { default: "2rem", [media.narrow]: "auto" },
	},
	removeLabel: {
		display: { default: "none", [media.narrow]: "inline" },
	},
	// Holds a desktop column open when the row has nothing to put in it.
	spacer: {
		display: { default: "block", [media.narrow]: "none" },
	},
	spacerNarrow: {
		display: "block",
	},
});

const gridStyles = {
	none: styles.gridNone,
	remove: styles.gridRemove,
	moveAndRemove: styles.gridMoveAndRemove,
};

type QueueRowProps = {
	song: QueueItem;
	position: number;
	actionColumn: ActionColumn;
	/** Whether the person looking at this row may remove it. */
	canRemove: boolean;
	/** A guest takes their own song back out; an admin removes someone else's. */
	ownRemoval: boolean;
	onMoveToPlayback?: (song: QueueItem) => Promise<Error | null | undefined>;
	onRemove?: (song: QueueItem) => Promise<Error | null>;
	onVote?: (song: QueueItem, direction: "up" | "down") => Promise<Error | null>;
	showVoteCount?: boolean;
};

function QueueRow({
	song,
	position,
	actionColumn,
	canRemove,
	ownRemoval,
	onMoveToPlayback,
	onRemove,
	onVote,
	showVoteCount,
}: QueueRowProps) {
	const metadata = useVideoMetadata(song.link);
	const isMoving = useSignal(false);
	const isRemoving = useSignal(false);
	const isVoting = useSignal(false);
	const confirmingRemove = useSignal(false);
	// Attribution and voting identity differ on the kiosk: requests made there
	// are anonymous, but votes still need someone to hang on.
	const voter = voterName();
	// 0 outside the kiosk, so the guest view keeps voting freely.
	const cooldown = useVoteCooldown();
	const { label: addedBy, isOwn } = requesterLabel(song, displayName());
	const votes = netVotes(song);
	const removeLabel = ownRemoval ? "Withdraw" : "Remove";
	const showRemove = Boolean(onRemove) && canRemove;
	const busy = isMoving.value || isRemoving.value;

	const userVote: "up" | "down" | null =
		voter && song.upvotes?.includes(voter)
			? "up"
			: voter && song.downvotes?.includes(voter)
				? "down"
				: null;

	const handleVote = async (direction: "up" | "down") => {
		if (!onVote || !voter || isVoting.value || cooldown > 0) return;

		isVoting.value = true;
		try {
			// A rejected vote otherwise looks exactly like a slow poll: the arrow
			// simply never fills in and the user keeps tapping.
			const error = await onVote(song, direction);
			if (error) notify(error.message);
		} finally {
			isVoting.value = false;
		}
	};

	const handleMoveToPlayback = async () => {
		if (!onMoveToPlayback || isMoving.value) return;

		isMoving.value = true;
		try {
			const error = await onMoveToPlayback(song);
			if (error) notify(error.message);
			else notify("Moved to the playback queue.", "success");
		} finally {
			isMoving.value = false;
		}
	};

	const handleRemove = async () => {
		if (!onRemove || isRemoving.value) return;

		isRemoving.value = true;
		try {
			const error = await onRemove(song);
			if (error) notify(error.message);
			else notify(ownRemoval ? "Withdrawn." : "Removed from the queue.", "success");
		} finally {
			isRemoving.value = false;
		}
	};

	return (
		<li {...stylex.props(styles.row, gridStyles[actionColumn])}>
			<span {...stylex.props(styles.position)}>{position}</span>

			<div {...stylex.props(styles.song)}>
				<a
					{...stylex.props(styles.songTitle)}
					href={song.link}
					title={metadata.value?.title}
					target="_blank"
					rel="noopener noreferrer"
				>
					{metadata.value?.title ?? <LoadingSpinner size={14} />}
				</a>
				<p {...stylex.props(styles.meta)}>
					<span {...stylex.props(styles.metaAuthor)}>
						{metadata.value?.author_name}
					</span>
					{addedBy ? (
						<span {...stylex.props(styles.metaRequester)}>· {addedBy}</span>
					) : null}
				</p>
			</div>

			<span {...stylex.props(styles.addedBy, isOwn && styles.addedByOwn)}>
				{addedBy}
			</span>

			{onVote ? (
				<div {...stylex.props(styles.voting)}>
					<button
						type="button"
						aria-label="Upvote"
						aria-pressed={userVote === "up"}
						disabled={isVoting.value || cooldown > 0}
						onClick={() => void handleVote("up")}
						{...stylex.props(styles.voteButton, styles.voteUp)}
					>
						<ArrowBigUp size={18} fill={userVote === "up" ? "currentColor" : "none"} />
					</button>
					<VoteCount votes={votes} />
					<button
						type="button"
						aria-label="Downvote"
						aria-pressed={userVote === "down"}
						disabled={isVoting.value || cooldown > 0}
						onClick={() => void handleVote("down")}
						{...stylex.props(styles.voteButton, styles.voteDown)}
					>
						<ArrowBigDown size={18} fill={userVote === "down" ? "currentColor" : "none"} />
					</button>
					{cooldown > 0 ? (
						<span {...stylex.props(styles.voteCooldown)}>
							Next vote in {cooldown}s
						</span>
					) : null}
				</div>
			) : showVoteCount ? (
				<div {...stylex.props(styles.voting)}>
					<VoteCount votes={votes} />
				</div>
			) : (
				<span {...stylex.props(styles.spacer)} />
			)}

			{actionColumn === "none" ? null : onMoveToPlayback || showRemove ? (
				<div
					{...stylex.props(
						styles.actions,
						onMoveToPlayback && styles.actionsFullWidth,
					)}
				>
					{onMoveToPlayback ? (
						<div {...stylex.props(styles.actionButton)}>
							<Button
								size="sm"
								disabled={busy}
								onClick={() => void handleMoveToPlayback()}
							>
								<ListMusic size={14} />
								{isMoving.value ? "Adding..." : "Move to Playback"}
							</Button>
						</div>
					) : null}
					{showRemove ? (
						<div {...stylex.props(styles.actionButton)}>
							<Button
								variant={onMoveToPlayback ? "danger" : "secondary"}
								size="sm"
								xstyle={
									onMoveToPlayback ? styles.removeButton : styles.withdrawButton
								}
								aria-label={removeLabel}
								title={removeLabel}
								disabled={busy}
								onClick={() => (confirmingRemove.value = true)}
							>
								<Trash2 size={14} />
								<span
									{...stylex.props(
										onMoveToPlayback
											? styles.removeLabel
											: styles.withdrawLabel,
									)}
								>
									{isRemoving.value ? "Removing" : removeLabel}
								</span>
							</Button>
						</div>
					) : null}
				</div>
			) : (
				<span
					{...stylex.props(
						styles.spacer,
						actionColumn === "remove" && styles.spacerNarrow,
					)}
				/>
			)}

			<ConfirmPopup
				open={confirmingRemove.value}
				message={
					ownRemoval
						? "Take this song back out of the queue?"
						: "Remove this song from the queue?"
				}
				onCancel={() => (confirmingRemove.value = false)}
				onConfirm={() => {
					confirmingRemove.value = false;
					void handleRemove();
				}}
			/>
		</li>
	);
}

type QueueProps = {
	queue: Signal<Queue>;
	showMoveToPlayback?: boolean;
	showRemoveButton?: boolean;
	/**
	 * Let a signed-in guest take their own requests back out. Decided per row,
	 * so nobody can clear someone else's song.
	 */
	allowOwnRemoval?: boolean;
	showVoteButtons?: boolean;
	showVoteCount?: boolean;
	title?: string;
	titleIcon?: LucideIcon;
	songs?: QueueItem[];
	emptyMessage?: string;
};

export default function Queue({
	queue,
	showMoveToPlayback = false,
	showRemoveButton = false,
	allowOwnRemoval = false,
	showVoteButtons = false,
	showVoteCount = false,
	title,
	titleIcon: TitleIcon = ListMusic,
	songs,
	emptyMessage = "No songs in this queue yet.",
}: QueueProps) {
	const listed = songs ?? queue.value.songs;
	const viewer = displayName();
	const playbackQueue = queues.value.find(
		(candidate) => candidate.value.id === PLAYBACK_QUEUE_ID,
	);

	const onMoveToPlayback =
		showMoveToPlayback && playbackQueue && queue.value.id !== PLAYBACK_QUEUE_ID
			? async (song: QueueItem) => {
					const addError = await addToQueue(
						playbackQueue.value.id,
						song.link,
						song.requestedBy,
					);
					if (addError) return addError;
					return await removeFromQueue(queue.value.id, song.link);
				}
			: undefined;
	// Nobody is signed in on the kiosk, so no request there belongs to the person
	// looking at it and the column stays off.
	const canWithdraw = allowOwnRemoval && viewer != null;
	const onRemove =
		showRemoveButton || canWithdraw
			? async (song: QueueItem) => removeFromQueue(queue.value.id, song.link)
			: undefined;
	const onVote = showVoteButtons
		? async (song: QueueItem, direction: "up" | "down") =>
				voteOnSong(queue.value.id, song.link, direction)
		: undefined;

	const actionColumn: ActionColumn = onMoveToPlayback
		? "moveAndRemove"
		: onRemove
			? "remove"
			: "none";

	return (
		<Card>
			<h3 {...stylex.props(styles.queueTitle)}>
				<TitleIcon size={18} />
				{title ?? queue.value.name}
			</h3>
			{listed.length === 0 ? (
				<EmptyState>{emptyMessage}</EmptyState>
			) : (
				<div {...stylex.props(styles.listHeader, gridStyles[actionColumn])}>
					<span {...stylex.props(styles.headerCell, styles.headerCentered)}>#</span>
					<span {...stylex.props(styles.headerCell)}>Song</span>
					<span {...stylex.props(styles.headerCell)}>Added By</span>
					<span {...stylex.props(styles.headerCell, styles.headerCentered)}>Voting</span>
					{actionColumn === "none" ? null : (
						<span {...stylex.props(styles.headerCell, styles.headerCentered)}>
							Action
						</span>
					)}
				</div>
			)}
			<ol {...stylex.props(styles.list)}>
				{listed.map((song, index) => (
					<QueueRow
						key={song.id}
						song={song}
						position={index + 1}
						actionColumn={actionColumn}
						canRemove={
							showRemoveButton || (canWithdraw && song.requestedBy === viewer)
						}
						ownRemoval={!showRemoveButton}
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

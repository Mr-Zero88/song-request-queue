import { addToQueue, queues, removeFromQueue } from "@/api/api.ts";
import {
	getVideoMetadata,
	getYouTubeVideoId,
	type NoEmbedResponse,
} from "@/api/youtube";
import { useSignal, type Signal } from "@preact/signals-react";
import * as stylex from "@stylexjs/stylex";
import { useEffect } from "react";

import { colors, fontSizes } from "../vars.stylex.ts";

import type { Queue, QueueItem } from "song-request-queue-common/types/queue";
import YoutubeThumbnail from "./youtubeThumbnail.tsx";

const PLAYBACK_QUEUE_ID = "playback";

const styles = stylex.create({
	root: {
		listStyleType: "none",
	},
	queueElement: {
		display: "flex",
		gap: "1rem",
		alignItems: "center",
		margin: "1.4rem 0.5rem",
	},
	queueElementDesc: {
		display: "flex",
		flexDirection: "column",
		justifyContent: "center",
	},
	queueElementDescTitle: {
		color: colors.primaryText,
		fontSize: fontSizes.xl,
		fontWeight: "700",
	},
	queueElementDescAuthor: {
		color: colors.primaryText,
		fontSize: fontSizes.md,
	},
	queueTitle: {
		color: colors.primaryText,
	},
	actionButtons: {
		marginLeft: "auto",
		display: "flex",
		gap: "0.75rem",
	},
	button: {
		padding: "0.4rem 0.8rem",
		borderStyle: "solid",
		borderRadius: "0.4rem",
		cursor: "pointer",
	},
	moveButton: {
		backgroundColor: colors.primaryText,
		color: colors.background,
	},
	removeButton: {
		backgroundColor: colors.background,
		borderColor: colors.primaryText,
		color: colors.primaryText,
	},
});

export interface QueueElement {
	url: string;
	title: string;
}

type QueueProps = React.HTMLAttributes<HTMLOListElement> & {
	queue: Signal<Queue>;
	showMoveToPlaybackButton?: boolean;
	showRemoveButton?: boolean;
};

type QueueSongItemProps = {
	element: QueueItem;
	onMoveToPlayback?: (element: QueueItem) => Promise<Error | null>;
	onRemove?: (element: QueueItem) => Promise<Error | null>;
};

function QueueSongItem({
	element,
	onMoveToPlayback,
	onRemove,
}: QueueSongItemProps) {
	const metadata = useSignal<NoEmbedResponse | null>(null);
	const isMoving = useSignal(false);
	const isRemoving = useSignal(false);

	useEffect(() => {
		const videoId = getYouTubeVideoId(element.link);

		if (videoId instanceof Error) {
			metadata.value = null;
			return;
		}

		getVideoMetadata(videoId).then((m) => {
			metadata.value = m;
		});
	}, [element.link, metadata]);

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
			<YoutubeThumbnail youtubeURL={element.link} />
			<div {...stylex.props(styles.queueElementDesc)}>
				<a {...stylex.props(styles.queueElementDescTitle)} href={element.link}>
					{metadata.value?.title}
				</a>
				<p {...stylex.props(styles.queueElementDescAuthor)}>
					{metadata.value?.author_name}
				</p>
			</div>
			{onMoveToPlayback || onRemove ? (
				<div {...stylex.props(styles.actionButtons)}>
					{onMoveToPlayback ? (
						<button
							type="button"
							disabled={isMoving.value || isRemoving.value}
							onClick={() => void handleMoveToPlayback()}
							{...stylex.props(styles.button, styles.moveButton)}
						>
							{isMoving.value ? "Adding..." : "Move to Playback"}
						</button>
					) : null}
					{onRemove ? (
						<button
							type="button"
							disabled={isMoving.value || isRemoving.value}
							onClick={() => void handleRemove()}
							{...stylex.props(styles.button, styles.removeButton)}
						>
							{isRemoving.value ? "Removing..." : "Remove"}
						</button>
					) : null}
				</div>
			) : null}
		</li>
	);
}

export default function Queue({
	queue,
	showMoveToPlaybackButton = false,
	showRemoveButton = false,
	...rest
}: QueueProps) {
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
					);
					if (addError) {
						return addError;
					}

					return removeFromQueue(queue.value.id, element.link);
				}
			: undefined;
	const onRemove = showRemoveButton
		? async (element: QueueItem) => removeFromQueue(queue.value.id, element.link)
		: undefined;

	return (
		<ol {...rest} {...stylex.props(styles.root)}>
			<h3 {...stylex.props(styles.queueTitle)}>{queue.value.name}</h3>
			{queue.value.songs.map((element) => (
				<QueueSongItem
					key={element.id}
					element={element}
					onMoveToPlayback={onMoveToPlayback}
					onRemove={onRemove}
				/>
			))}
		</ol>
	);
}

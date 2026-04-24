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

const styles = stylex.create({
	root: {
		listStyleType: "none",
	},
	queueElement: {
		display: "flex",
		justifyItems: "space-between",
		margin: "1.4rem 0.5rem",
	},
	queueElementDesc: {
		margin: "1rem 0.5rem 1rem 2rem",
		display: "flex",
		flexDirection: "column",
	},
	queueElementDescTitle: {
		color: colors.primaryText,
		fontSize: fontSizes.xl,
		fontWeight: "700",
	},
	queueElementDescAuthor: {
		color: colors.primaryText,
	},
	queueTitle: {
		color: colors.primaryText,
	},
});

export interface QueueElement {
	url: string;
	title: string;
}

type QueueProps = React.HTMLAttributes<HTMLOListElement> & {
	queue: Signal<Queue>;
};

type QueueSongItemProps = {
	element: QueueItem;
};

function QueueSongItem({ element }: QueueSongItemProps) {
	const metadata = useSignal<NoEmbedResponse | null>(null);

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
		</li>
	);
}

export default function Queue({ queue, ...rest }: QueueProps) {
	return (
		<ol {...rest} {...stylex.props(styles.root)}>
			<h1 {...stylex.props(styles.queueTitle)}>{queue.value.name}</h1>
			{queue.value.songs.map((element) => (
				<QueueSongItem key={element.id} element={element} />
			))}
		</ol>
	);
}

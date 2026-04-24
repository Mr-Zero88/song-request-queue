import { queues } from "@/api/api.ts";
import {
	getVideoMetadata,
	getYouTubeVideoId,
	type NoEmbedResponse,
} from "@/api/youtube";
import YoutubeThumbnail from "@/components/youtubeThumbnail.tsx";
import { useSignal } from "@preact/signals-react";
import * as stylex from "@stylexjs/stylex";
import { useEffect } from "react";

import { colors, fontSizes } from "../vars.stylex.ts";

const PLAYBACK_QUEUE_ID = "playback";

const styles = stylex.create({
	root: {},
	nowPlaying: {
		color: colors.primaryText,
	},
	card: {
		display: "flex",
		gap: "1rem",
		alignItems: "center",
		margin: "1.4rem 0.5rem",
	},
	desc: {
		display: "flex",
		flexDirection: "column",
		justifyContent: "center",
	},
	title: {
		color: colors.primaryText,
		fontSize: fontSizes.xl,
		fontWeight: "700",
	},
	author: {
		color: colors.primaryText,
		fontSize: fontSizes.md,
	},
	empty: {
		color: colors.primaryText,
		fontSize: fontSizes.md,
	},
});

type CurrentPlaybackSongProps = {
	link: string;
};

function CurrentPlaybackSong({ link }: CurrentPlaybackSongProps) {
	const metadata = useSignal<NoEmbedResponse | null>(null);

	useEffect(() => {
		const videoId = getYouTubeVideoId(link);

		if (videoId instanceof Error) {
			metadata.value = null;
			return;
		}

		void getVideoMetadata(videoId)
			.then((m) => {
				metadata.value = m;
			})
			.catch(() => {
				metadata.value = null;
			});
	}, [link, metadata]);

	return (
		<div {...stylex.props(styles.card)}>
			<YoutubeThumbnail youtubeURL={link} />
			<div {...stylex.props(styles.desc)}>
				<a {...stylex.props(styles.title)} href={link}>
					{metadata.value?.title ?? "Current Song"}
				</a>
				<p {...stylex.props(styles.author)}>
					{metadata.value?.author_name ?? "Loading..."}
				</p>
			</div>
		</div>
	);
}

export default function NowPlaying() {
	const playbackQueue = queues.value.find(
		(queue) => queue.value.id === PLAYBACK_QUEUE_ID,
	);
	const currentSong = playbackQueue?.value.songs[0];

	return (
		<section {...stylex.props(styles.root)}>
			<ol>
				<h3 {...stylex.props(styles.nowPlaying)}>Now Playing</h3>
				{currentSong ? (
					<CurrentPlaybackSong link={currentSong.link} />
				) : (
					<p {...stylex.props(styles.empty)}>Nothing is currently playing.</p>
				)}
			</ol>
		</section>
	);
}

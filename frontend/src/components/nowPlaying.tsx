import { media } from "../breakpoints.stylex.ts";
import { displayName, queues } from "@/api/api.ts";
import { netVotes, requesterLabel, voteNoun } from "@/utils/song.ts";
import { useVideoMetadata } from "@/hooks/useVideoMetadata.ts";
import { useElapsedTime } from "@/hooks/useElapsedTime.ts";
import YoutubeThumbnail from "@/components/youtubeThumbnail.tsx";
import Card from "@/components/ui/card.tsx";
import EmptyState from "@/components/ui/emptyState.tsx";
import LoadingSpinner from "@/components/ui/loadingSpinner.tsx";
import VoteCount from "@/components/ui/voteCount.tsx";
import * as stylex from "@stylexjs/stylex";
import { Radio } from "lucide-react";

import { colors, fontSizes, fontWeights, space } from "../vars.stylex.ts";
import { PLAYBACK_QUEUE_ID } from "../constants.ts";

import type { QueueItem } from "song-request-queue-common/types/queue";

const waveBounce = stylex.keyframes({
	"0%, 100%": { transform: "scaleY(0.35)" },
	"50%": { transform: "scaleY(1)" },
});

const styles = stylex.create({
	title: {
		display: "flex",
		alignItems: "center",
		gap: space.xs,
		color: colors.primaryText,
		fontSize: fontSizes.lg,
		fontWeight: fontWeights.semibold,
		marginTop: 0,
		marginBottom: space.sm,
	},
	song: {
		display: "flex",
		flexDirection: "column",
		gap: space.sm,
		width: "100%",
		minWidth: 0,
	},
	songTitle: {
		display: "-webkit-box",
		WebkitBoxOrient: "vertical",
		WebkitLineClamp: { default: 3, [media.narrow]: 2 },
		overflow: "hidden",
		width: "100%",
		color: colors.primaryText,
		fontSize: { default: fontSizes.lg, [media.narrow]: fontSizes.md },
		fontWeight: fontWeights.bold,
		lineHeight: 1.3,
	},
	author: {
		color: colors.secondaryText,
		fontSize: fontSizes.sm,
		margin: 0,
		overflow: "hidden",
		textOverflow: "ellipsis",
		whiteSpace: "nowrap",
	},
	playbackRow: {
		display: "flex",
		alignItems: "center",
		gap: space.md,
	},
	progress: {
		display: "flex",
		flexDirection: "column",
		gap: space.xs,
		flex: 1,
		minWidth: 0,
	},
	progressLine: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		gap: space.md,
	},
	elapsed: {
		color: colors.secondaryText,
		fontSize: fontSizes.xs,
		fontVariantNumeric: "tabular-nums",
		flexShrink: 0,
	},
	meta: {
		display: "flex",
		justifyContent: "center",
		textAlign: "center",
	},
	requestedBy: {
		color: colors.secondaryText,
		fontSize: fontSizes.sm,
		minWidth: 0,
		// On a phone a single line truncates away the vote count itself, so let
		// it wrap instead — the row is centred either way.
		overflow: { default: "hidden", [media.narrow]: "visible" },
		textOverflow: { default: "ellipsis", [media.narrow]: "clip" },
		whiteSpace: { default: "nowrap", [media.narrow]: "normal" },
		overflowWrap: "anywhere",
	},
	requestedByOwn: {
		color: colors.accent,
		fontWeight: fontWeights.semibold,
	},
	waveform: {
		display: "flex",
		alignItems: "center",
		justifyContent: "space-between",
		gap: "2px",
		height: "1.75rem",
		flex: 1,
		minWidth: 0,
		maxWidth: "26rem",
	},
	waveformBar: {
		display: "block",
		width: "3px",
		borderRadius: "1px",
		backgroundColor: colors.accent,
		transformOrigin: "center",
		animationName: waveBounce,
		animationDuration: "1.1s",
		animationTimingFunction: "ease-in-out",
		animationIterationCount: { default: "infinite", [media.reducedMotion]: 0 },
	},
});

const barHeights = [
	40, 70, 55, 90, 35, 65, 100, 50, 80, 30, 60, 95, 45, 75, 40, 85, 55, 70, 30,
	90, 45, 65, 100, 50, 80, 35, 60, 95,
];

function Waveform() {
	return (
		<div {...stylex.props(styles.waveform)}>
			{barHeights.map((height, index) => (
				<span
					key={index}
					{...stylex.props(styles.waveformBar)}
					style={{ height: `${height}%`, animationDelay: `${index * 0.06}s` }}
				/>
			))}
		</div>
	);
}

type CurrentSongProps = {
	song: QueueItem;
	hero: boolean;
};

function CurrentSong({ song, hero }: CurrentSongProps) {
	const metadata = useVideoMetadata(song.link);
	const elapsed = useElapsedTime(song.startedAt);
	const { label: requester, isOwn } = requesterLabel(song, displayName());
	const votes = netVotes(song);

	return (
		<div {...stylex.props(styles.song)}>
			<a
				{...stylex.props(styles.songTitle)}
				href={song.link}
				title={metadata.value?.title}
				target="_blank"
				rel="noopener noreferrer"
			>
				{metadata.value?.title ?? <LoadingSpinner size={16} />}
			</a>
			<p {...stylex.props(styles.author)}>{metadata.value?.author_name}</p>

			<div {...stylex.props(styles.playbackRow)}>
				<YoutubeThumbnail
					youtubeURL={song.link}
					alt={metadata.value?.title ?? "Video thumbnail"}
					size={hero ? "compactHero" : "compact"}
				/>
				<div {...stylex.props(styles.progress)}>
					<div {...stylex.props(styles.progressLine)}>
						{elapsed ? (
							<span {...stylex.props(styles.elapsed)}>{elapsed}</span>
						) : null}
						<Waveform />
					</div>

					<div {...stylex.props(styles.meta)}>
						<span
							{...stylex.props(
								styles.requestedBy,
								isOwn && styles.requestedByOwn,
							)}
						>
							{requester ? `Requested by ${requester} · ` : ""}
							<VoteCount votes={votes} /> {voteNoun(votes)}
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}

type NowPlayingProps = {
	hero?: boolean;
};

export default function NowPlaying({ hero = false }: NowPlayingProps) {
	const playbackQueue = queues.value.find(
		(queue) => queue.value.id === PLAYBACK_QUEUE_ID,
	);
	// the playback queue keeps every song ever moved into it as history;
	// the most recently added one is the one currently playing
	const currentSong =
		playbackQueue?.value.songs[playbackQueue.value.songs.length - 1];

	return (
		<Card>
			<h3 {...stylex.props(styles.title)}>
				<Radio size={18} />
				Now Playing
			</h3>
			{currentSong ? (
				<CurrentSong song={currentSong} hero={hero} />
			) : (
				<EmptyState>Nothing is currently playing.</EmptyState>
			)}
		</Card>
	);
}

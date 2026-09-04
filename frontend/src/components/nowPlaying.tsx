import { queues, session } from "@/api/api.ts";
import { useVideoMetadata } from "@/hooks/useVideoMetadata.ts";
import YoutubeThumbnail from "@/components/youtubeThumbnail.tsx";
import Card from "@/components/ui/card.tsx";
import EmptyState from "@/components/ui/emptyState.tsx";
import LoadingSpinner from "@/components/ui/loadingSpinner.tsx";
import * as stylex from "@stylexjs/stylex";
import { Radio } from "lucide-react";

import { colors, fontSizes, fontWeights, space } from "../vars.stylex.ts";
import { PLAYBACK_QUEUE_ID } from "../constants.ts";

import type { QueueItem } from "song-request-queue-common/types/queue";

const NARROW = "@media (max-width: 639px)";
const REDUCED_MOTION = "@media (prefers-reduced-motion: reduce)";

const waveBounce = stylex.keyframes({
	"0%, 100%": { transform: "scaleY(0.35)" },
	"50%": { transform: "scaleY(1)" },
});

const styles = stylex.create({
	title: {
		display: "flex",
		alignItems: "center",
		gap: space.xs,
		color: colors.secondaryText,
		fontSize: fontSizes.sm,
		fontWeight: fontWeights.semibold,
		textTransform: "uppercase",
		marginTop: 0,
		marginBottom: space.sm,
	},
	wrapper: {
		display: "flex",
		flexDirection: "column",
		gap: space.sm,
		width: "100%",
		minWidth: 0,
	},
	playbackRow: {
		display: "flex",
		alignItems: "center",
		gap: space.md,
	},
	progressCol: {
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
		gap: space.xl,
	},
	songTitle: {
		display: "-webkit-box",
		WebkitBoxOrient: "vertical",
		WebkitLineClamp: { default: 3, [NARROW]: 2 },
		overflow: "hidden",
		width: "100%",
		color: colors.primaryText,
		fontSize: { default: fontSizes.lg, [NARROW]: fontSizes.md },
		fontWeight: fontWeights.bold,
		lineHeight: 1.3,
	},
	author: {
		color: colors.secondaryText,
		fontSize: fontSizes.sm,
		margin: 0,
	},
	time: {
		color: colors.secondaryText,
		fontSize: fontSizes.xs,
		fontVariantNumeric: "tabular-nums",
		flexShrink: 0,
	},
	metaRow: {
		display: "flex",
		justifyContent: "center",
		textAlign: "center",
	},
	requestedBy: {
		color: colors.secondaryText,
		fontSize: fontSizes.sm,
		minWidth: 0,
		overflow: { default: "hidden", [NARROW]: "visible" },
		// On a phone the single line truncates away the vote count itself, so
		// let it wrap instead — the row is centred either way.
		textOverflow: { default: "ellipsis", [NARROW]: "clip" },
		whiteSpace: { default: "nowrap", [NARROW]: "normal" },
	},
	requestedByOwn: {
		color: colors.accent,
		fontWeight: fontWeights.semibold,
	},
	voteCount: {
		color: colors.secondaryText,
		fontSize: fontSizes.sm,
		fontWeight: fontWeights.semibold,
	},
	voteCountPositive: {
		color: colors.success,
	},
	voteCountNegative: {
		color: colors.danger,
	},
	waveform: {
		display: "flex",
		alignItems: "center",
		justifyContent: "space-between",
		gap: "2px",
		height: "1.75rem",
		flex: 1,
		minWidth: 0,
		// Without the time labels beside it the bars would spread across the whole
		// card and read as sparse rather than as a waveform.
		maxWidth: "26rem",
		marginLeft: "auto",
		marginRight: "auto",
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
		animationIterationCount: { default: "infinite", [REDUCED_MOTION]: 0 },
	},
});

const WAVEFORM_BAR_HEIGHTS = [
	40, 70, 55, 90, 35, 65, 100, 50, 80, 30, 60, 95, 45, 75, 40, 85, 55, 70, 30,
	90, 45, 65, 100, 50, 80, 35, 60, 95,
];

function PlayingWaveform() {
	return (
		<div {...stylex.props(styles.waveform)}>
			{WAVEFORM_BAR_HEIGHTS.map((height, index) => (
				<span
					key={index}
					{...stylex.props(styles.waveformBar)}
					style={{ height: `${height}%`, animationDelay: `${index * 0.06}s` }}
				/>
			))}
		</div>
	);
}

type CurrentPlaybackSongProps = {
	song: QueueItem;
	hero: boolean;
};

function CurrentPlaybackSong({ song, hero }: CurrentPlaybackSongProps) {
	const metadata = useVideoMetadata(song.link);
	const username = session.value?.username;
	const isOwnRequest = song.requestedBy != null && song.requestedBy === username;
	const requesterLabel = isOwnRequest ? "You" : (song.requestedBy ?? null);
	const netVotes = (song.upvotes?.length ?? 0) - (song.downvotes?.length ?? 0);
	const voteCountStyle =
		netVotes > 0
			? styles.voteCountPositive
			: netVotes < 0
				? styles.voteCountNegative
				: null;

	return (
		<div {...stylex.props(styles.wrapper)}>
			<a
				{...stylex.props(styles.songTitle)}
				href={song.link}
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
				<div {...stylex.props(styles.progressCol)}>
					{/* No track length is available, so the waveform stands alone rather
					    than framing invented timestamps. */}
					<div {...stylex.props(styles.progressLine)}>
						<PlayingWaveform />
					</div>

					<div {...stylex.props(styles.metaRow)}>
						<span
							{...stylex.props(
								styles.requestedBy,
								isOwnRequest ? styles.requestedByOwn : null,
							)}
						>
							{requesterLabel ? `Requested by ${requesterLabel} \u00b7 ` : ""}
							<span {...stylex.props(styles.voteCount, voteCountStyle)}>
								{netVotes}
							</span>{" "}
							{Math.abs(netVotes) === 1 ? "vote" : "votes"}
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
	// the most recently added one is treated as the one currently playing
	const currentSong =
		playbackQueue?.value.songs[playbackQueue.value.songs.length - 1];

	return (
		<Card>
			<h3 {...stylex.props(styles.title)}>
				<Radio size={14} />
				Now Playing
			</h3>
			{currentSong ? (
				<CurrentPlaybackSong song={currentSong} hero={hero} />
			) : (
				<EmptyState>Nothing is currently playing.</EmptyState>
			)}
		</Card>
	);
}

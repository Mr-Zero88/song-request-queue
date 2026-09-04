import { addToQueue, deleteSession, queues, session } from "@/api/api.ts";
import SearchBar from "@/components/searchBar.tsx";
import Queue from "@/components/queue.tsx";
import NowPlaying from "@/components/nowPlaying.tsx";
import History from "@/components/history.tsx";
import Footer from "@/components/footer.tsx";
import Button from "@/components/ui/button.tsx";
import Card from "@/components/ui/card.tsx";
import YoutubeThumbnail from "@/components/youtubeThumbnail.tsx";
import QueueClosedBanner from "@/components/queueClosedBanner.tsx";
import { useVideoMetadata } from "@/hooks/useVideoMetadata.ts";
import { MOCK_QUEUE_CLOSED, PLAYBACK_QUEUE_ID, REQUEST_QUEUE_NAME } from "@/constants.ts";
import * as stylex from "@stylexjs/stylex";
import { Heart, LogOut } from "lucide-react";

import { colors, fontSizes, fontWeights, space } from "../vars.stylex.ts";

import type { Role } from "song-request-queue-common/types/session";
import type { QueueItem } from "song-request-queue-common/types/queue";

type QueueViewProps = {
	role: Role;
};

const LG = "@media (min-width: 1024px)";

const styles = stylex.create({
	header: {
		display: "flex",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: space.md,
	},
	greeting: {
		color: colors.primaryText,
		fontSize: fontSizes.lg,
		fontWeight: fontWeights.semibold,
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
});

const requestLink = (link: string) => {
	const requestQueue = queues.value.find(
		(q) => q.value.name === REQUEST_QUEUE_NAME,
	);
	if (requestQueue) {
		void addToQueue(requestQueue.value.id, link, session.value?.username);
	}
};

const handleLogout = async () => {
	await deleteSession();
	session.value = null;
};

type OwnRequestRowProps = {
	song: QueueItem;
	position: number;
	aheadCount: number;
};

function OwnRequestRow({ song, position, aheadCount }: OwnRequestRowProps) {
	const metadata = useVideoMetadata(song.link);

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
				Hey {session.value?.username}, request your favorit songs!
			</span>
			<Button variant="ghost" size="sm" onClick={() => void handleLogout()}>
				<LogOut size={14} />
				Log out
			</Button>
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

				<div {...stylex.props(styles.adminSearchRow)}>
					<SearchBar onSelect={requestLink} />
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
			{MOCK_QUEUE_CLOSED ? (
				<QueueClosedBanner />
			) : (
				<SearchBar onSelect={requestLink} />
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

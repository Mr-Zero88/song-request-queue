import { media } from "../breakpoints.stylex.ts";
import { deleteSession, queues, session } from "@/api/api.ts";
import SearchBar from "@/components/searchBar.tsx";
import PageHeader from "@/components/pageHeader.tsx";
import Queue from "@/components/queue.tsx";
import QueueBoard from "@/components/queueBoard.tsx";
import NowPlaying from "@/components/nowPlaying.tsx";
import Button from "@/components/ui/button.tsx";
import { notify } from "@/components/ui/toast.tsx";
import { requestSong } from "@/requestSong.ts";
import { PLAYBACK_QUEUE_ID, REQUEST_QUEUE_NAME } from "@/constants.ts";
import * as stylex from "@stylexjs/stylex";
import { LogOut } from "lucide-react";

import { colors, fontSizes, fontWeights, space } from "../vars.stylex.ts";

import type { Role } from "song-request-queue-common/types/session";

type QueueViewProps = {
	role: Role;
};

const styles = stylex.create({
	adminHeader: {
		display: "flex",
		justifyContent: "space-between",
		alignItems: "center",
		gap: space.md,
		marginBottom: space.lg,
		paddingBottom: space.md,
		borderBottomStyle: "solid",
		borderBottomWidth: "1px",
		borderBottomColor: colors.border,
	},
	adminTitle: {
		color: colors.primaryText,
		fontSize: { default: fontSizes.xxl, [media.narrow]: fontSizes.xl },
		fontWeight: fontWeights.bold,
	},
	adminSearch: {
		maxWidth: "40rem",
		marginBottom: space.lg,
	},
	// A queue table's fixed columns come to ~460px before the title gets any
	// room at all, so three of them side by side would need a screen nobody
	// has. Two, once there is width for two.
	adminGrid: {
		display: "grid",
		gridTemplateColumns: { default: "1fr", [media.console]: "1fr 1fr" },
		gap: space.lg,
		alignItems: "start",
	},
	nowPlayingCell: {
		gridColumn: { default: "auto", [media.console]: "1 / -1" },
		minWidth: 0,
	},
	// Grid items default to min-content, which lets a long song title push a
	// column wider than its track.
	gridColumn: {
		minWidth: 0,
	},
});

const logout = async () => {
	const error = await deleteSession();
	if (error) {
		// The server-side session and its httpOnly cookie are still alive, so
		// clearing `session` here would only log the user straight back in on the
		// next reload. Keep them signed in and say what happened instead.
		notify(`${error.message} You are still signed in.`);
		return;
	}

	session.value = null;
};

function LogoutButton() {
	return (
		<Button variant="ghost" size="sm" onClick={() => void logout()}>
			<LogOut size={14} />
			Log out
		</Button>
	);
}

export default function QueueView({ role }: QueueViewProps) {
	const playbackQueue = queues.value.find(
		(queue) => queue.value.id === PLAYBACK_QUEUE_ID,
	);
	const requestQueue = queues.value.find(
		(queue) => queue.value.name === REQUEST_QUEUE_NAME,
	);

	if (role === "admin") {
		return (
			<>
				<div {...stylex.props(styles.adminHeader)}>
					<span {...stylex.props(styles.adminTitle)}>DJ Console</span>
					<LogoutButton />
				</div>

				<div {...stylex.props(styles.adminSearch)}>
					<SearchBar
						onSelect={(link) => void requestSong(link, session.value?.username)}
					/>
				</div>

				<div {...stylex.props(styles.adminGrid)}>
					<div {...stylex.props(styles.nowPlayingCell)}>
						<NowPlaying hero />
					</div>
					<div {...stylex.props(styles.gridColumn)}>
						{playbackQueue ? (
							<Queue
								queue={playbackQueue}
								title="Playback Queue"
								showRemoveButton
							/>
						) : null}
					</div>
					<div {...stylex.props(styles.gridColumn)}>
						{requestQueue ? (
							<Queue
								queue={requestQueue}
								showMoveToPlayback
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
		<QueueBoard
			header={
				<PageHeader
					title={`Hey ${session.value?.username}, request your favorite songs!`}
					action={<LogoutButton />}
				/>
			}
			onSelectSong={(link) => void requestSong(link, session.value?.username)}
		/>
	);
}

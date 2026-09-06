import type { ReactNode } from "react";
import * as stylex from "@stylexjs/stylex";

import { displayName, queues } from "@/api/api.ts";
import Footer from "@/components/footer.tsx";
import History from "@/components/history.tsx";
import NowPlaying from "@/components/nowPlaying.tsx";
import Queue from "@/components/queue.tsx";
import QueueClosedBanner from "@/components/queueClosedBanner.tsx";
import SearchBar from "@/components/searchBar.tsx";
import { countOwnRequests } from "@/utils/song.ts";
import {
	MAX_OPEN_REQUESTS,
	MOCK_QUEUE_CLOSED,
	PLAYBACK_QUEUE_ID,
	REQUEST_QUEUE_NAME,
} from "@/constants.ts";

import { colors, fontSizes, fontWeights, space } from "../vars.stylex.ts";

type QueueBoardProps = {
	/** Whatever sits above the search bar: a greeting, or the kiosk's join code. */
	header: ReactNode;
	onSelectSong: (link: string) => void;
};

const styles = stylex.create({
	search: {
		display: "flex",
		flexDirection: "column",
		gap: space.xs,
	},
	// Sits directly under the search field, where someone finds out they can't
	// add another song before they go looking for one.
	allowance: {
		display: "flex",
		alignItems: "center",
		gap: space.xs,
		color: colors.secondaryText,
		fontSize: fontSizes.sm,
		margin: 0,
	},
	allowanceCount: {
		color: colors.primaryText,
		fontWeight: fontWeights.semibold,
	},
	allowanceFull: {
		color: colors.danger,
		fontWeight: fontWeights.semibold,
	},
});

/**
 * The page every guest-facing view is built from: search, what's playing, the
 * queues, history, footer.
 *
 * The guest view and the kiosk differ only in what sits at the top and what a
 * picked song does, so those are props rather than a second copy of the page.
 */
export default function QueueBoard({
	header,
	onSelectSong,
}: QueueBoardProps) {
	const viewer = displayName();
	const requestQueue = queues.value.find(
		(queue) => queue.value.name === REQUEST_QUEUE_NAME,
	);
	// Kiosk requests are anonymous, so there is nobody to hold to a limit and
	// nothing to count — the allowance line stays off there.
	const openRequests = requestQueue
		? countOwnRequests(requestQueue.value, viewer)
		: 0;
	const atLimit = openRequests >= MAX_OPEN_REQUESTS;

	return (
		<>
			{header}

			{MOCK_QUEUE_CLOSED ? (
				<QueueClosedBanner />
			) : (
				<div {...stylex.props(styles.search)}>
					<SearchBar onSelect={onSelectSong} />
					{viewer ? (
						<p {...stylex.props(styles.allowance)}>
							<span
								{...stylex.props(
									atLimit ? styles.allowanceFull : styles.allowanceCount,
								)}
							>
								{openRequests} / {MAX_OPEN_REQUESTS}
							</span>
							{atLimit
								? "requests used — withdraw one to add another."
								: "requests used."}
						</p>
					) : null}
				</div>
			)}

			<NowPlaying />

			{queues.value.map((queue) => {
				if (queue.value.id === PLAYBACK_QUEUE_ID) return null;
				const isRequestQueue = queue.value.name === REQUEST_QUEUE_NAME;
				return (
					<Queue
						key={queue.value.id}
						queue={queue}
						showVoteButtons={isRequestQueue}
						allowOwnRemoval={isRequestQueue}
					/>
				);
			})}

			<History />
			<Footer />
		</>
	);
}

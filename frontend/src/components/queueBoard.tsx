import type { ReactNode } from "react";

import { queues } from "@/api/api.ts";
import Footer from "@/components/footer.tsx";
import History from "@/components/history.tsx";
import NowPlaying from "@/components/nowPlaying.tsx";
import Queue from "@/components/queue.tsx";
import QueueClosedBanner from "@/components/queueClosedBanner.tsx";
import SearchBar from "@/components/searchBar.tsx";
import { MOCK_QUEUE_CLOSED, PLAYBACK_QUEUE_ID, REQUEST_QUEUE_NAME } from "@/constants.ts";

type QueueBoardProps = {
	/** Whatever sits above the search bar: a greeting, or the kiosk's join code. */
	header: ReactNode;
	onSelectSong: (link: string) => void;
	/** Optional block between Now Playing and the queues. */
	belowNowPlaying?: ReactNode;
};

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
	belowNowPlaying,
}: QueueBoardProps) {
	return (
		<>
			{header}

			{MOCK_QUEUE_CLOSED ? (
				<QueueClosedBanner />
			) : (
				<SearchBar onSelect={onSelectSong} />
			)}

			<NowPlaying />
			{belowNowPlaying}

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

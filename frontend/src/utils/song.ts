import type { QueueItem } from "song-request-queue-common/types/queue";

/** Upvotes minus downvotes. */
export function netVotes(song: QueueItem): number {
	return (song.upvotes?.length ?? 0) - (song.downvotes?.length ?? 0);
}

/** "vote" or "votes", matched to the score's magnitude. */
export function voteNoun(count: number): string {
	return Math.abs(count) === 1 ? "vote" : "votes";
}

/**
 * Who to credit for a request, from the reader's point of view.
 *
 * `viewer` is null on the kiosk, where nobody is signed in, so nothing there is
 * ever labelled "You".
 */
export function requesterLabel(
	song: QueueItem,
	viewer: string | null,
): { label: string | null; isOwn: boolean } {
	const isOwn = song.requestedBy != null && song.requestedBy === viewer;
	return { label: isOwn ? "You" : (song.requestedBy ?? null), isOwn };
}

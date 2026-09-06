import { addToQueue, queues } from "@/api/api.ts";
import { notify } from "@/components/ui/toast.tsx";
import { countOwnRequests } from "@/utils/song.ts";
import { MAX_OPEN_REQUESTS, REQUEST_QUEUE_NAME } from "@/constants.ts";

/**
 * Put a song into the request queue and report the outcome.
 *
 * Shared by the guest view and the kiosk so the lookup, the wording and the
 * error handling exist once. The kiosk omits `requestedBy`: nobody is signed in
 * there, so its requests are anonymous — and anonymous requests can't be
 * counted against a per-person limit.
 */
export async function requestSong(link: string, requestedBy?: string) {
	const requestQueue = queues.value.find(
		(queue) => queue.value.name === REQUEST_QUEUE_NAME,
	);

	if (!requestQueue) {
		notify(
			"Couldn't find the request queue — it may still be loading. Try again in a moment.",
		);
		return;
	}

	// Checked here as well as at the button so a stale screen can't slip an
	// extra song past the limit. The server still has to enforce it.
	if (requestedBy) {
		const open = countOwnRequests(requestQueue.value, requestedBy);
		if (open >= MAX_OPEN_REQUESTS) {
			notify(
				`You already have ${MAX_OPEN_REQUESTS} songs waiting. Withdraw one before requesting another.`,
			);
			return;
		}
	}

	const error = await addToQueue(requestQueue.value.id, link, requestedBy);
	if (error) {
		notify(error.message);
		return;
	}

	notify("Added to the request queue.", "success");
}

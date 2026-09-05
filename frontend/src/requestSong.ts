import { addToQueue, queues } from "@/api/api.ts";
import { notify } from "@/components/ui/toast.tsx";
import { REQUEST_QUEUE_NAME } from "@/constants.ts";

/**
 * Put a song into the request queue and report any failure.
 *
 * Shared by the guest view and the kiosk so the lookup, the wording and the
 * error handling exist once. The kiosk omits `requestedBy`: nobody is signed in
 * there, so its requests are anonymous.
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

	const error = await addToQueue(requestQueue.value.id, link, requestedBy);
	if (error) {
		notify(error.message);
	}
}

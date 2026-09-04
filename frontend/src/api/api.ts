import type { Session } from "song-request-queue-common/types/session";
import { Signal, signal } from "@preact/signals-react";
import type { Queue, VoteDirection } from "song-request-queue-common/types/queue";

// tracks whether the backend is reachable at all (network failure, or the
// dev/reverse proxy reporting the upstream is down), as opposed to a normal
// application-level error response (4xx or a handled 5xx)
export const serviceAvailable = signal(true);

// returned by the dev/reverse proxy itself when it can't reach the backend
const GATEWAY_ERROR_STATUSES = new Set([502, 503, 504]);

async function request(
	input: string,
	init?: RequestInit,
): Promise<Response | null> {
	try {
		const res = await fetch(input, init);
		if (GATEWAY_ERROR_STATUSES.has(res.status)) {
			serviceAvailable.value = false;
			return null;
		}
		serviceAvailable.value = true;
		return res;
	} catch {
		serviceAvailable.value = false;
		return null;
	}
}

async function getSession(): Promise<Session | null> {
	let endpoint = "/api/session";

	let res = await request(endpoint);
	if (!res || !res.ok) {
		return null;
	} else {
		return await res.json();
	}
}

export type CreateSessionResult =
	| { session: Session; error?: undefined }
	| { session?: undefined; error: string };

export async function createSession(
	username: string,
	pin?: string,
): Promise<CreateSessionResult> {
	let endpoint = "/api/session";

	let res = await request(endpoint, {
		headers: { Accept: "application/json", "Content-Type": "application/json" },
		method: "POST",
		body: JSON.stringify({ username, pin }),
	});
	if (!res) {
		return { error: "Can't reach the server right now" };
	} else if (!res.ok) {
		const body = await res.json().catch(() => null);
		return { error: body?.cause?.message ?? body?.message ?? "Failed to create session" };
	} else {
		return { session: await res.json() };
	}
}

export async function deleteSession(): Promise<Error | null> {
	let endpoint = "/api/session";

	let res = await request(endpoint, { method: "DELETE" });
	if (!res || !res.ok) {
		return new Error("Failed to log out");
	}

	return null;
}

async function getQueues(): Promise<Queue[]> {
	let endpoint = "/api/queues";

	let res = await request(endpoint, {
		headers: { Accept: "application/json", "Content-Type": "application/json" },
		method: "GET",
	});
	if (!res || !res.ok) {
		return [];
	} else {
		return await res.json();
	}
}

async function getQueue(id: string): Promise<Queue | null> {
	let endpoint = `/api/queue/${id}`;

	let res = await request(endpoint, {
		headers: { Accept: "application/json", "Content-Type": "application/json" },
		method: "GET",
	});
	if (!res || !res.ok) {
		return null;
	} else {
		return await res.json();
	}
}

const youtubeRegex =
	/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|music\.youtube\.com)\/.+$/;

function isYouTubeLink(url: string): boolean {
	return youtubeRegex.test(url);
}

export async function addToQueue(
	id: string,
	link: string,
	requestedBy?: string,
): Promise<Error | null> {
	let endpoint = `/api/queue/${id}`;

	if (!isYouTubeLink(link)) {
		return new Error("not a valid YouTube link");
	}

	let res = await request(endpoint, {
		headers: { Accept: "application/json", "Content-Type": "application/json" },
		method: "PUT",
		body: JSON.stringify({ link, requestedBy }),
	});
	if (!res || !res.ok) {
		return new Error("Error while adding Song to Queue");
	}

	return null;
}

export async function voteOnSong(
	id: string,
	link: string,
	direction: VoteDirection,
): Promise<Error | null> {
	const username = session.value?.username;
	if (!username) {
		return new Error("Must be logged in to vote");
	}

	let res = await request(`/api/queue/${id}/vote`, {
		headers: { Accept: "application/json", "Content-Type": "application/json" },
		method: "POST",
		body: JSON.stringify({ link, username, direction }),
	});
	if (!res || !res.ok) {
		return new Error("Error while voting on Song");
	}

	return null;
}

export async function removeFromQueue(
	id: string,
	link: string,
): Promise<Error | null> {
	let endpoint = `/api/queue/${id}`;

	if (!isYouTubeLink(link)) {
		return new Error("not a valid YouTube link");
	}

	let res = await request(endpoint, {
		headers: { Accept: "application/json", "Content-Type": "application/json" },
		method: "DELETE",
		body: JSON.stringify({ link }),
	});
	if (!res || !res.ok) {
		return new Error("Error while removing Song from Queue");
	}

	return null;
}

export const session = signal<Session | null>(null);
getSession().then((s) => (session.value = s));

export const queues = signal<Signal<Queue>[]>([]);
getQueues().then(
	(q) =>
		(queues.value = q.map((qq) => {
			const queue = signal<Queue>(qq);
			setInterval(() => {
				getQueue(qq.id).then((qqq) => {
					if (qqq) {
						queue.value = qqq;
					}
				});
			}, 1000);

			return queue;
		})),
);

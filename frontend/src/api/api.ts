import type { Session } from "song-request-queue-common/types/session";
import { Signal, signal } from "@preact/signals-react";
import type { Queue } from "song-request-queue-common/types/queue";

export const session = signal<Session | null>(null);
getSession().then((s) => (session.value = s));

async function getSession(): Promise<Session | null> {
	let endpoint = "/api/session";

	let res = await fetch(endpoint);
	if (!res.ok) {
		return null;
	} else {
		return await res.json();
	}
}

export async function createSession(username: string): Promise<Session | null> {
	let endpoint = "/api/session";

	let res = await fetch(endpoint, {
		headers: { Accept: "application/json", "Content-Type": "application/json" },
		method: "POST",
		body: JSON.stringify({ username }),
	});
	if (!res.ok) {
		return null;
	} else {
		return await res.json();
	}
}

export const queues = signal<Signal<Queue>[]>([]);

async function getQueues(): Promise<Queue[]> {
	let endpoint = "/api/queues";

	let res = await fetch(endpoint, {
		headers: { Accept: "application/json", "Content-Type": "application/json" },
		method: "GET",
	});
	if (!res.ok) {
		return [];
	} else {
		return await res.json();
	}
}

async function getQueue(id: string): Promise<Queue | null> {
	let endpoint = `/api/queue/${id}`;

	let res = await fetch(endpoint, {
		headers: { Accept: "application/json", "Content-Type": "application/json" },
		method: "GET",
	});
	if (!res.ok) {
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
): Promise<Error | null> {
	let endpoint = `/api/queue/${id}`;

	if (!isYouTubeLink(link)) {
		return new Error("not a valid YouTube link");
	}

	let res = await fetch(endpoint, {
		headers: { Accept: "application/json", "Content-Type": "application/json" },
		method: "PUT",
		body: JSON.stringify({ link }),
	});
	if (!res.ok) {
		return new Error("Error while adding Song to Queue");
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

	let res = await fetch(endpoint, {
		headers: { Accept: "application/json", "Content-Type": "application/json" },
		method: "DELETE",
		body: JSON.stringify({ link }),
	});
	if (!res.ok) {
		return new Error("Error while removing Song from Queue");
	}

	return null;
}

getSession().then((s) => (session.value = s));
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

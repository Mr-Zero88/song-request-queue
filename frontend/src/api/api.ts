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

export async function addToQueue(
	id: string,
	link: string,
): Promise<Queue | null> {
	let endpoint = `/api/queue/${id}`;

	let res = await fetch(endpoint, {
		headers: { Accept: "application/json", "Content-Type": "application/json" },
		method: "PUT",
		body: JSON.stringify({ link }),
	});
	if (!res.ok) {
		return null;
	}

	const queue: Queue = await res.json();
	const existingQueue = queues.value.find(
		(queueSignal) => queueSignal.value.id === queue.id,
	);

	if (existingQueue) {
		existingQueue.value = queue;
	} else {
		queues.value = [...queues.value, signal(queue)];
	}

	return queue;
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

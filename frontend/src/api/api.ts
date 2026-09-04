import type { Session } from "song-request-queue-common/types/session";
import { Signal, signal } from "@preact/signals-react";
import type { Queue, VoteDirection } from "song-request-queue-common/types/queue";
import { isKioskRoute } from "@/appView.ts";

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

// The API records every vote against a username, but the kiosk is a shared
// screen with nobody signed in. Give the device a stable identity so its votes
// register at all. Consequence: the kiosk counts as a single voter, so a second
// tap on the same arrow retracts the first person's vote.
const KIOSK_VOTER_KEY = "kioskVoterId";

function kioskVoterId(): string {
	let id = localStorage.getItem(KIOSK_VOTER_KEY);
	if (!id) {
		id = `kiosk-${Math.random().toString(36).slice(2, 10)}`;
		localStorage.setItem(KIOSK_VOTER_KEY, id);
	}
	return id;
}

// A kiosk stands in the open, so one person could otherwise plant themselves in
// front of it and swing the whole queue. One vote per minute is enough to keep
// it fair. The allowance is per device, not global: two tablets each keep their
// own timestamp in their own storage, exactly like their voter identity.
const KIOSK_VOTE_INTERVAL_MS = 60_000;
const KIOSK_LAST_VOTE_KEY = "kioskLastVoteAt";

function storedKioskVoteReadyAt(): number {
	if (!isKioskRoute()) return 0;
	const last = Number(localStorage.getItem(KIOSK_LAST_VOTE_KEY) ?? 0);
	return Number.isFinite(last) && last > 0 ? last + KIOSK_VOTE_INTERVAL_MS : 0;
}

// Epoch ms from which the kiosk may vote again; 0 means it is free to vote.
// Survives a reload so the cooldown cannot be skipped by refreshing the page.
export const kioskVoteReadyAt = signal(storedKioskVoteReadyAt());

// Milliseconds still to wait, 0 when a vote is allowed.
export function kioskVoteCooldownMs(): number {
	if (!isKioskRoute()) return 0;
	return Math.max(0, kioskVoteReadyAt.value - Date.now());
}

function startKioskCooldown() {
	if (!isKioskRoute()) return;
	const now = Date.now();
	localStorage.setItem(KIOSK_LAST_VOTE_KEY, String(now));
	kioskVoteReadyAt.value = now + KIOSK_VOTE_INTERVAL_MS;
}

// Who a vote is attributed to. On the kiosk this is always the device, even if
// a session cookie happens to linger on that machine — a shared screen must not
// cast votes as whoever last signed in on it.
export function voterName(): string | null {
	if (isKioskRoute()) return kioskVoterId();
	return session.value?.username ?? null;
}

// Who the interface treats as "you" for attribution. Nobody owns anything on a
// shared screen, so the kiosk shows every request under its requester's name.
export function displayName(): string | null {
	return isKioskRoute() ? null : (session.value?.username ?? null);
}

export async function voteOnSong(
	id: string,
	link: string,
	direction: VoteDirection,
): Promise<Error | null> {
	const username = voterName();
	if (!username) {
		return new Error("Must be logged in to vote");
	}

	const waitMs = kioskVoteCooldownMs();
	if (waitMs > 0) {
		return new Error(
			`One vote per minute — ${Math.ceil(waitMs / 1000)}s to go`,
		);
	}

	let res = await request(`/api/queue/${id}/vote`, {
		headers: { Accept: "application/json", "Content-Type": "application/json" },
		method: "POST",
		body: JSON.stringify({ link, username, direction }),
	});
	if (!res || !res.ok) {
		return new Error("Error while voting on Song");
	}

	startKioskCooldown();
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

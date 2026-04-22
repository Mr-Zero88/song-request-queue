import type { Session } from "song-request-queue-common/types/session";
import { signal } from "@preact/signals-react";

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

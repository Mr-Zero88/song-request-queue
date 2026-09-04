import type { Session } from "song-request-queue-common/types/session";

export type AppView =
	| { kind: "login" }
	| { kind: "queues"; session: Session }
	| { kind: "error"; message: string };

export function resolveView(session: Session | null): AppView {
	if (session == null) return { kind: "login" };
	return { kind: "queues", session };
}

export function isKioskRoute(): boolean {
	const path = window.location.pathname;
	return path === "/kiosk" || path === "/kiosk/";
}

export function isAdminRoute(): boolean {
	const path = window.location.pathname;
	return path === "/admin" || path === "/admin/";
}

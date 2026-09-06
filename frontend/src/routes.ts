export function isKioskRoute(): boolean {
	const path = window.location.pathname;
	return path === "/kiosk" || path === "/kiosk/";
}

export function isAdminRoute(): boolean {
	const path = window.location.pathname;
	return path === "/admin" || path === "/admin/";
}

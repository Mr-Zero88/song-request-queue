import { serviceAvailable, session } from "@/api/api.ts";
import Login from "@/components/login.tsx";
import QueueView from "@/components/queueView.tsx";
import Kiosk from "@/components/kiosk.tsx";
import ServiceUnavailable from "@/components/serviceUnavailable.tsx";
import ToastHost from "@/components/ui/toast.tsx";
import { isAdminRoute, isKioskRoute } from "@/routes.ts";

import * as stylex from "@stylexjs/stylex";
import { layout, space } from "./vars.stylex.ts";

const styles = stylex.create({
	page: {
		maxWidth: layout.contentMaxWidth,
		margin: "auto",
		padding: space.lg,
		boxSizing: "border-box",
		display: "flex",
		flexDirection: "column",
		gap: space.md,
	},
	// The DJ console lays its queues out side by side and needs the full width.
	wide: {
		maxWidth: "100%",
		margin: 0,
	},
	// Login and the offline notice are single panels, so they sit in the middle
	// of the viewport instead of running down a column.
	centered: {
		minHeight: "100vh",
		boxSizing: "border-box",
		padding: space.lg,
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
	},
});

function AppRoutes() {
	if (!serviceAvailable.value) {
		return (
			<main {...stylex.props(styles.centered)}>
				<ServiceUnavailable />
			</main>
		);
	}

	if (isKioskRoute()) {
		return (
			<main {...stylex.props(styles.page)}>
				<Kiosk />
			</main>
		);
	}

	const isAdmin = session.value?.role === "admin";

	if (isAdminRoute()) {
		return isAdmin ? (
			<main {...stylex.props(styles.page, styles.wide)}>
				<QueueView role="admin" />
			</main>
		) : (
			<main {...stylex.props(styles.centered)}>
				<Login mode="admin" />
			</main>
		);
	}

	if (!session.value) {
		return (
			<main {...stylex.props(styles.centered)}>
				<Login />
			</main>
		);
	}

	return (
		<main {...stylex.props(styles.page, isAdmin && styles.wide)}>
			<QueueView role={session.value.role} />
		</main>
	);
}

export default function App() {
	return (
		<>
			<AppRoutes />
			{/* Mounted once so every view reports failures in the same place. */}
			<ToastHost />
		</>
	);
}

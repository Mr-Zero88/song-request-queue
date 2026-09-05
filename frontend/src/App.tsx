import { serviceAvailable, session } from "@/api/api.ts";
import Login from "@/components/login";
import QueueView from "@/components/queueView.tsx";
import Kiosk from "@/components/kiosk.tsx";
import ServiceUnavailable from "@/components/serviceUnavailable.tsx";
import ToastHost from "@/components/ui/toast.tsx";
import { isAdminRoute, isKioskRoute, resolveView } from "@/appView.ts";

import * as stylex from "@stylexjs/stylex";
import { layout, space } from "./vars.stylex.ts";

const styles = stylex.create({
	root: {
		maxWidth: layout.contentMaxWidth,
		margin: "auto",
		padding: space.lg,
		boxSizing: "border-box",
		display: "flex",
		flexDirection: "column",
		gap: space.md,
	},
	rootWide: {
		maxWidth: "100%",
		margin: 0,
		padding: space.lg,
		boxSizing: "border-box",
		display: "flex",
		flexDirection: "column",
		gap: space.md,
	},
	rootCentered: {
		minHeight: "100vh",
		boxSizing: "border-box",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		padding: space.lg,
	},
});

function AppRoutes() {
	if (!serviceAvailable.value) {
		return (
			<main {...stylex.props(styles.rootCentered)}>
				<ServiceUnavailable />
			</main>
		);
	}

	if (isKioskRoute()) {
		return (
			<main {...stylex.props(styles.root)}>
				<Kiosk />
			</main>
		);
	}

	const isAdminSession = session.value?.role === "admin";

	if (isAdminRoute()) {
		if (!isAdminSession) {
			return (
				<main {...stylex.props(styles.rootCentered)}>
					<Login mode="admin" />
				</main>
			);
		}
		return (
			<main {...stylex.props(styles.rootWide)}>
				<QueueView role="admin" />
			</main>
		);
	}

	const view = resolveView(session.value);

	if (view.kind === "login") {
		return (
			<main {...stylex.props(styles.rootCentered)}>
				<Login />
			</main>
		);
	}

	return (
		<main
			{...stylex.props(
				view.kind === "queues" && isAdminSession ? styles.rootWide : styles.root,
			)}
		>
			{view.kind === "queues" ? (
				<QueueView role={view.session.role} />
			) : (
				<p>{view.message}</p>
			)}
		</main>
	);
}

function App() {
	return (
		<>
			<AppRoutes />
			{/* Mounted once so every view reports failures in the same place. */}
			<ToastHost />
		</>
	);
}

export default App;

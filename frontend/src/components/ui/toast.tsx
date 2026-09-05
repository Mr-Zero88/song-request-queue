import { signal } from "@preact/signals-react";
import * as stylex from "@stylexjs/stylex";
import { AlertCircle, Check, X } from "lucide-react";

import { colors, fontSizes, radius, shadows, space } from "../../vars.stylex.ts";

const NARROW = "@media (max-width: 639px)";
const REDUCED_MOTION = "@media (prefers-reduced-motion: reduce)";

export type ToastTone = "error" | "success";

type Toast = {
	id: number;
	message: string;
	tone: ToastTone;
};

const VISIBLE_MS = 4000;
// Enough to tell someone what went wrong without burying the screen.
const MAX_VISIBLE = 3;

const toasts = signal<Toast[]>([]);
let nextId = 0;

function dismiss(id: number) {
	toasts.value = toasts.value.filter((toast) => toast.id !== id);
}

/**
 * Show a transient message. One place for every failure the interface needs to
 * report, instead of a banner per view and an error string per row.
 */
export function notify(message: string, tone: ToastTone = "error") {
	const id = nextId++;
	// Repeating the same message just restarts its timer rather than stacking
	// copies — tapping a dead vote button three times should say it once.
	const withoutDuplicate = toasts.value.filter((t) => t.message !== message);
	toasts.value = [...withoutDuplicate, { id, message, tone }].slice(-MAX_VISIBLE);
	setTimeout(() => dismiss(id), VISIBLE_MS);
}

const slideIn = stylex.keyframes({
	from: { opacity: 0, transform: "translateY(0.75rem)" },
	to: { opacity: 1, transform: "translateY(0)" },
});

const styles = stylex.create({
	host: {
		position: "fixed",
		insetInline: 0,
		bottom: space.lg,
		zIndex: 1100,
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		gap: space.sm,
		// The strip spans the viewport so toasts stay centred, but only the
		// toasts themselves should catch a tap.
		pointerEvents: "none",
		// Without border-box the inset pins the *content* edges and the padding
		// spills off-screen, leaving the toast flush against the display edge.
		boxSizing: "border-box",
		paddingInline: space.lg,
	},
	toast: {
		pointerEvents: "auto",
		// The project has no global border-box reset, so without this the toast's
		// own padding lands outside max-width and overflows the host's inset.
		boxSizing: "border-box",
		display: "flex",
		alignItems: "center",
		gap: space.sm,
		width: { default: "auto", [NARROW]: "100%" },
		// align-items:center sizes the toast to its text, which then overflows the
		// host's padding. Cap it against the host as well as at a readable width.
		maxWidth: "min(28rem, 100%)",
		paddingBlock: space.sm,
		paddingInline: space.md,
		borderRadius: radius.lg,
		borderStyle: "solid",
		borderWidth: "1px",
		backgroundColor: colors.surface,
		boxShadow: shadows.lg,
		color: colors.primaryText,
		fontSize: fontSizes.sm,
		animationName: { default: slideIn, [REDUCED_MOTION]: "none" },
		animationDuration: "180ms",
		animationTimingFunction: "ease-out",
	},
	error: { borderColor: colors.danger },
	success: { borderColor: colors.success },
	iconError: { color: colors.danger, flexShrink: 0 },
	iconSuccess: { color: colors.success, flexShrink: 0 },
	message: { flex: 1, minWidth: 0, overflowWrap: "anywhere" },
	close: {
		display: "flex",
		flexShrink: 0,
		padding: 0,
		borderStyle: "none",
		backgroundColor: "transparent",
		color: colors.secondaryText,
		cursor: "pointer",
	},
});

/** Mounted once, at the app root. */
export default function ToastHost() {
	if (toasts.value.length === 0) return null;

	return (
		<div {...stylex.props(styles.host)}>
			{toasts.value.map((toast) => (
				<div
					key={toast.id}
					role={toast.tone === "error" ? "alert" : "status"}
					{...stylex.props(
						styles.toast,
						toast.tone === "error" ? styles.error : styles.success,
					)}
				>
					{toast.tone === "error" ? (
						<AlertCircle size={16} {...stylex.props(styles.iconError)} />
					) : (
						<Check size={16} {...stylex.props(styles.iconSuccess)} />
					)}
					<span {...stylex.props(styles.message)}>{toast.message}</span>
					<button
						type="button"
						aria-label="Dismiss"
						onClick={() => dismiss(toast.id)}
						{...stylex.props(styles.close)}
					>
						<X size={14} />
					</button>
				</div>
			))}
		</div>
	);
}

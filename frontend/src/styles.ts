import * as stylex from "@stylexjs/stylex";

// Reusable media queries
const DARK = "@media (prefers-color-scheme: dark)";
const SM = "@media (min-width: 640px)";
const MD = "@media (min-width: 768px)";
const LG = "@media (min-width: 1024px)";

export const colors = stylex.defineVars({
	primaryText: { default: "#111827", [DARK]: "#f9fafb" },
	secondaryText: { default: "#4b5563", [DARK]: "#9ca3af" },
	mutedText: { default: "#6b7280", [DARK]: "#94a3b8" },

	accent: { default: "#2563eb", [DARK]: "#60a5fa" },
	accentHover: { default: "#1d4ed8", [DARK]: "#93c5fd" },
	accentSoft: { default: "#dbeafe", [DARK]: "#1e3a8a" },

	success: { default: "#16a34a", [DARK]: "#4ade80" },
	warning: { default: "#d97706", [DARK]: "#fbbf24" },
	danger: { default: "#dc2626", [DARK]: "#f87171" },

	background: { default: "#ffffff", [DARK]: "#0f172a" },
	backgroundSubtle: { default: "#f8fafc", [DARK]: "#111827" },
	surface: { default: "#f3f4f6", [DARK]: "#1f2937" },
	surfaceElevated: { default: "#ffffff", [DARK]: "#334155" },

	border: { default: "#e5e7eb", [DARK]: "#374151" },
	lineColor: { default: "#d1d5db", [DARK]: "#475569" },

	focusRing: { default: "#93c5fd", [DARK]: "#60a5fa" },
	overlay: { default: "rgba(15, 23, 42, 0.08)", [DARK]: "rgba(0, 0, 0, 0.45)" },
});

export const fontSizes = stylex.defineVars({
	xs: {
		default: "0.75rem",
		[SM]: "0.75rem",
		[MD]: "0.8125rem",
	},
	sm: {
		default: "0.875rem",
		[SM]: "0.875rem",
		[MD]: "0.9375rem",
	},
	md: {
		default: "1rem",
		[SM]: "1rem",
		[MD]: "1.0625rem",
	},
	lg: {
		default: "1.125rem",
		[SM]: "1.1875rem",
		[MD]: "1.25rem",
	},
	xl: {
		default: "1.25rem",
		[SM]: "1.375rem",
		[MD]: "1.5rem",
	},
	xxl: {
		default: "1.5rem",
		[SM]: "1.75rem",
		[MD]: "2rem",
		[LG]: "2.25rem",
	},
});

export const spacing = stylex.defineVars({
	xxs: {
		default: "0.125rem",
		[MD]: "0.125rem",
	},
	xs: {
		default: "0.25rem",
		[MD]: "0.25rem",
	},
	sm: {
		default: "0.5rem",
		[MD]: "0.625rem",
	},
	md: {
		default: "0.75rem",
		[MD]: "1rem",
	},
	lg: {
		default: "1rem",
		[MD]: "1.25rem",
	},
	xl: {
		default: "1.5rem",
		[MD]: "2rem",
	},
	xxl: {
		default: "2rem",
		[MD]: "3rem",
	},
});

export const radius = stylex.defineVars({
	sm: { default: "0.25rem" },
	md: { default: "0.5rem" },
	lg: { default: "0.75rem" },
	xl: { default: "1rem" },
	full: { default: "9999px" },
});

export const layout = stylex.defineVars({
	contentMaxWidth: {
		default: "100%",
		[SM]: "40rem",
		[MD]: "48rem",
		[LG]: "64rem",
	},
	containerPaddingInline: {
		default: "1rem",
		[SM]: "1.25rem",
		[MD]: "1.5rem",
		[LG]: "2rem",
	},
	containerPaddingBlock: {
		default: "1rem",
		[MD]: "1.5rem",
		[LG]: "2rem",
	},
});

export const shadows = stylex.defineVars({
	sm: {
		default: "0 1px 2px rgba(0, 0, 0, 0.06)",
		[DARK]: "0 1px 2px rgba(0, 0, 0, 0.3)",
	},
	md: {
		default: "0 4px 12px rgba(0, 0, 0, 0.08)",
		[DARK]: "0 4px 12px rgba(0, 0, 0, 0.35)",
	},
	lg: {
		default: "0 10px 30px rgba(0, 0, 0, 0.12)",
		[DARK]: "0 10px 30px rgba(0, 0, 0, 0.45)",
	},
});

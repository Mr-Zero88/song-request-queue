import * as stylex from "@stylexjs/stylex";

const DARK = "@media (prefers-color-scheme: dark)";
const XS = "@media (max-width: 639px)";
const SM = "@media (min-width: 640px)";
const MD = "@media (min-width: 768px)";
const LG = "@media (min-width: 1024px)";

const lightDark = <T extends string>(light: T, dark: T) => ({
	default: light,
	[DARK]: dark,
});

export const colors = stylex.defineVars({
	primaryText: lightDark("#111827", "#f9fafb"),
	secondaryText: lightDark("#6b7280", "#9ca3af"),

	background: lightDark("#ffffff", "#101010"),
	surface: lightDark("#f9fafb", "#18181b"),
	border: lightDark("#e5e7eb", "#27272a"),

	accent: lightDark("#2563eb", "#3b82f6"),
	accentText: lightDark("#ffffff", "#ffffff"),

	danger: lightDark("#dc2626", "#f87171"),
	dangerText: lightDark("#ffffff", "#ffffff"),

	success: lightDark("#16a34a", "#4ade80"),
});

export const fontSizes = stylex.defineVars({
	xs: "0.75rem",
	sm: "0.875rem",
	md: "1rem",
	lg: "1.125rem",
	xl: "1.25rem",
	xxl: "1.5rem",
});

export const fontWeights = stylex.defineVars({
	regular: "400",
	medium: "500",
	semibold: "600",
	bold: "700",
});

export const space = stylex.defineVars({
	xs: "0.25rem",
	sm: "0.5rem",
	md: "0.75rem",
	lg: "1rem",
	xl: "1.5rem",
	xxl: "2rem",
});

export const radius = stylex.defineVars({
	sm: "0.25rem",
	md: "0.5rem",
	lg: "0.75rem",
	xl: "1rem",
	full: "9999px",
});

export const layout = stylex.defineVars({
	contentMaxWidth: {
		default: "100%",
		[XS]: "28rem",
		[SM]: "40rem",
		[MD]: "48rem",
		[LG]: "64rem",
	},
});

export const shadows = stylex.defineVars({
	sm: lightDark(
		"0 1px 2px rgba(0, 0, 0, 0.06)",
		"0 1px 2px rgba(0, 0, 0, 0.3)",
	),
	md: lightDark(
		"0 4px 12px rgba(0, 0, 0, 0.18)",
		"0 4px 12px rgba(0, 0, 0, 0.35)",
	),
	lg: lightDark(
		"0 10px 30px rgba(0, 0, 0, 0.20)",
		"0 10px 30px rgba(0, 0, 0, 0.45)",
	),
});

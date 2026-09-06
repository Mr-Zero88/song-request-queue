import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import type { ButtonHTMLAttributes } from "react";

import { colors, fontSizes, fontWeights, radius, space } from "../../vars.stylex.ts";

export type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
	variant?: ButtonVariant;
	size?: ButtonSize;
	/** Extra StyleX styles, so a caller can fit a button to its column. */
	xstyle?: StyleXStyles;
};

const styles = stylex.create({
	base: {
		display: "inline-flex",
		alignItems: "center",
		justifyContent: "center",
		gap: space.xs,
		fontWeight: fontWeights.semibold,
		borderRadius: radius.sm,
		borderStyle: "solid",
		borderWidth: "1px",
		borderColor: "transparent",
		cursor: "pointer",
	},
	disabled: {
		cursor: "not-allowed",
		opacity: 0.6,
	},

	sizeSm: {
		fontSize: fontSizes.sm,
		padding: `${space.xs} ${space.sm}`,
		minHeight: "2.25rem",
	},
	sizeMd: {
		fontSize: fontSizes.md,
		padding: `${space.sm} ${space.md}`,
		minHeight: "2.75rem",
	},
	sizeLg: {
		fontSize: fontSizes.lg,
		padding: `${space.md} ${space.lg}`,
		minHeight: "3.25rem",
	},

	primary: {
		backgroundColor: colors.accent,
		color: colors.accentText,
	},
	secondary: {
		backgroundColor: colors.surface,
		borderColor: colors.border,
		color: colors.primaryText,
	},
	danger: {
		backgroundColor: colors.danger,
		color: colors.dangerText,
	},
	ghost: {
		backgroundColor: "transparent",
		color: colors.primaryText,
	},
});

const sizeStyles = {
	sm: styles.sizeSm,
	md: styles.sizeMd,
	lg: styles.sizeLg,
};

const variantStyles = {
	primary: styles.primary,
	secondary: styles.secondary,
	danger: styles.danger,
	ghost: styles.ghost,
};

export default function Button({
	variant = "primary",
	size = "md",
	disabled,
	xstyle,
	...rest
}: ButtonProps) {
	return (
		<button
			type="button"
			disabled={disabled}
			{...rest}
			{...stylex.props(
				styles.base,
				sizeStyles[size],
				variantStyles[variant],
				disabled && styles.disabled,
				xstyle,
			)}
		/>
	);
}

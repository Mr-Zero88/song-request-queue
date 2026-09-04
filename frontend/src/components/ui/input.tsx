import * as stylex from "@stylexjs/stylex";
import type { InputHTMLAttributes } from "react";

import { colors, fontSizes, radius, space } from "../../vars.stylex.ts";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
	label?: string;
	error?: string;
};

const styles = stylex.create({
	root: {
		display: "flex",
		flexDirection: "column",
		gap: space.sm,
	},
	label: {
		fontSize: fontSizes.sm,
		fontWeight: "600",
		color: colors.secondaryText,
	},
	input: {
		fontSize: fontSizes.md,
		padding: `${space.md} ${space.md}`,
		minHeight: "2.75rem",
		boxSizing: "border-box",
		borderRadius: radius.sm,
		borderStyle: "solid",
		borderWidth: "1px",
		borderColor: colors.border,
		backgroundColor: colors.background,
		color: colors.primaryText,
		outlineStyle: "none",
		":focus": {
			borderColor: colors.accent,
			boxShadow: `0 0 0 3px color-mix(in srgb, ${colors.accent} 30%, transparent)`,
		},
	},
	inputError: {
		borderColor: colors.danger,
	},
	error: {
		fontSize: fontSizes.sm,
		color: colors.danger,
	},
});

export default function Input({ label, error, id, ...rest }: InputProps) {
	return (
		<div {...stylex.props(styles.root)}>
			{label ? (
				<label {...stylex.props(styles.label)} htmlFor={id}>
					{label}
				</label>
			) : null}
			<input
				id={id}
				{...rest}
				{...stylex.props(styles.input, error ? styles.inputError : null)}
			/>
			{error ? <span {...stylex.props(styles.error)}>{error}</span> : null}
		</div>
	);
}

import * as stylex from "@stylexjs/stylex";

import { colors } from "../../vars.stylex.ts";

type LoadingSpinnerProps = {
	size?: number;
};

const styles = stylex.create({
	spinner: (size: number) => ({
		width: `${size}px`,
		height: `${size}px`,
		borderRadius: "9999px",
		borderStyle: "solid",
		borderWidth: "2px",
		borderColor: colors.border,
		borderTopColor: colors.accent,
		animationName: stylex.keyframes({
			from: { transform: "rotate(0deg)" },
			to: { transform: "rotate(360deg)" },
		}),
		animationDuration: "0.6s",
		animationIterationCount: "infinite",
		animationTimingFunction: "linear",
	}),
});

export default function LoadingSpinner({ size = 16 }: LoadingSpinnerProps) {
	return (
		<span
			role="status"
			aria-label="Loading"
			{...stylex.props(styles.spinner(size))}
		/>
	);
}

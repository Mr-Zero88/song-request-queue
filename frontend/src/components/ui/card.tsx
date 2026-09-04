import * as stylex from "@stylexjs/stylex";
import type { HTMLAttributes } from "react";

import { colors, radius, shadows, space } from "../../vars.stylex.ts";

type CardProps = HTMLAttributes<HTMLDivElement>;

const styles = stylex.create({
	root: {
		backgroundColor: colors.surface,
		borderRadius: radius.lg,
		boxShadow: shadows.sm,
		padding: space.md,
	},
});

export default function Card({ children, ...rest }: CardProps) {
	return (
		<div {...rest} {...stylex.props(styles.root)}>
			{children}
		</div>
	);
}

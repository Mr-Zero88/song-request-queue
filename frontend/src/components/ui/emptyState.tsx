import * as stylex from "@stylexjs/stylex";
import type { ReactNode } from "react";

import { colors, fontSizes, space } from "../../vars.stylex.ts";

type EmptyStateProps = {
	children: ReactNode;
};

const styles = stylex.create({
	root: {
		color: colors.secondaryText,
		fontSize: fontSizes.md,
		textAlign: "center",
		padding: space.lg,
	},
});

export default function EmptyState({ children }: EmptyStateProps) {
	return <p {...stylex.props(styles.root)}>{children}</p>;
}

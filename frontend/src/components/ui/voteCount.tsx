import * as stylex from "@stylexjs/stylex";

import { colors, fontSizes, fontWeights } from "../../vars.stylex.ts";

type VoteCountProps = {
	votes: number;
};

const styles = stylex.create({
	count: {
		color: colors.secondaryText,
		fontSize: fontSizes.sm,
		fontWeight: fontWeights.semibold,
		fontVariantNumeric: "tabular-nums",
		minWidth: "1.25rem",
		textAlign: "center",
	},
	positive: {
		color: colors.success,
	},
	negative: {
		color: colors.danger,
	},
});

export default function VoteCount({ votes }: VoteCountProps) {
	return (
		<span
			{...stylex.props(
				styles.count,
				votes > 0 && styles.positive,
				votes < 0 && styles.negative,
			)}
		>
			{votes}
		</span>
	);
}

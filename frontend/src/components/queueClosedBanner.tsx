import * as stylex from "@stylexjs/stylex";
import { Lock } from "lucide-react";

import Card from "@/components/ui/card.tsx";
import { colors, fontSizes, fontWeights, space } from "../vars.stylex.ts";

const styles = stylex.create({
	row: {
		display: "flex",
		alignItems: "center",
		gap: space.sm,
	},
	icon: {
		color: colors.secondaryText,
		flexShrink: 0,
	},
	title: {
		color: colors.primaryText,
		fontSize: fontSizes.md,
		fontWeight: fontWeights.semibold,
		margin: 0,
	},
	subtitle: {
		color: colors.secondaryText,
		fontSize: fontSizes.sm,
		margin: 0,
	},
});

export default function QueueClosedBanner() {
	return (
		<Card>
			<div {...stylex.props(styles.row)}>
				<Lock size={20} {...stylex.props(styles.icon)} />
				<div>
					<p {...stylex.props(styles.title)}>Requests are closed</p>
					<p {...stylex.props(styles.subtitle)}>
						The DJ isn't accepting new song requests right now.
					</p>
				</div>
			</div>
		</Card>
	);
}

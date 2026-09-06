import * as stylex from "@stylexjs/stylex";
import type { ReactNode } from "react";

import { media } from "../breakpoints.stylex.ts";
import { colors, fontSizes, fontWeights, space } from "../vars.stylex.ts";

type PageHeaderProps = {
	title: ReactNode;
	subtitle?: ReactNode;
	/** Sits on the right: log out, the kiosk's join code. */
	action?: ReactNode;
};

const styles = stylex.create({
	header: {
		display: "flex",
		justifyContent: "space-between",
		// Once the title wraps to two lines the action would otherwise float
		// halfway down the paragraph.
		alignItems: { default: "center", [media.narrow]: "flex-start" },
		gap: space.md,
		marginBottom: space.md,
	},
	text: {
		display: "flex",
		flexDirection: "column",
		gap: space.xs,
		minWidth: 0,
	},
	title: {
		color: colors.primaryText,
		fontSize: { default: fontSizes.lg, [media.narrow]: fontSizes.md },
		fontWeight: fontWeights.semibold,
		// Names come from users and can be a single unbroken run of characters.
		overflowWrap: "anywhere",
	},
	subtitle: {
		color: colors.accent,
		fontSize: fontSizes.xs,
		fontWeight: fontWeights.semibold,
		overflowWrap: "anywhere",
	},
	action: {
		flexShrink: 0,
	},
});

export default function PageHeader({
	title,
	subtitle,
	action,
}: PageHeaderProps) {
	return (
		<div {...stylex.props(styles.header)}>
			<div {...stylex.props(styles.text)}>
				<span {...stylex.props(styles.title)}>{title}</span>
				{subtitle ? (
					<span {...stylex.props(styles.subtitle)}>{subtitle}</span>
				) : null}
			</div>
			{action ? <div {...stylex.props(styles.action)}>{action}</div> : null}
		</div>
	);
}

import * as stylex from "@stylexjs/stylex";
import { WifiOff } from "lucide-react";

import Button from "@/components/ui/button.tsx";
import Footer from "@/components/footer.tsx";

import { colors, fontSizes, fontWeights, layout, space } from "../vars.stylex.ts";

const styles = stylex.create({
	root: {
		maxWidth: layout.contentMaxWidth,
		margin: "auto",
		display: "flex",
		flexDirection: "column",
	},
	panel: {
		padding: space.md,
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		textAlign: "center",
		gap: space.sm,
	},
	icon: {
		color: colors.danger,
		marginBottom: space.xs,
	},
	title: {
		color: colors.primaryText,
		fontSize: fontSizes.xxl,
		fontWeight: fontWeights.bold,
		margin: 0,
	},
	subtitle: {
		color: colors.secondaryText,
		fontSize: fontSizes.md,
		margin: 0,
	},
});

export default function ServiceUnavailable() {
	return (
		<div {...stylex.props(styles.root)}>
			<div {...stylex.props(styles.panel)}>
				<WifiOff size={40} {...stylex.props(styles.icon)} />
				<h1 {...stylex.props(styles.title)}>Can't reach the server</h1>
				<p {...stylex.props(styles.subtitle)}>
					The Song Request Queue backend isn't responding right now. It might be
					restarting — try again in a moment.
				</p>
				<Button variant="secondary" onClick={() => window.location.reload()}>
					Retry
				</Button>
			</div>
			<Footer />
		</div>
	);
}

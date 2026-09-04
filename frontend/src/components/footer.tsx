import * as stylex from "@stylexjs/stylex";
import { ExternalLink } from "lucide-react";

import { colors, fontSizes, space } from "../vars.stylex.ts";

const styles = stylex.create({
	footer: {
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
		gap: space.xs,
		marginTop: space.lg,
		padding: space.md,
	},
	footerLink: {
		display: "flex",
		alignItems: "center",
		gap: space.xs,
		color: colors.secondaryText,
		fontSize: fontSizes.xs,
		textDecoration: "none",
	},
});

const GITHUB_REPO_URL = "https://github.com/Mr-Zero88/song-request-queue";

export default function Footer() {
	return (
		<div {...stylex.props(styles.footer)}>
			<a
				href={GITHUB_REPO_URL}
				target="_blank"
				rel="noopener noreferrer"
				{...stylex.props(styles.footerLink)}
			>
				<ExternalLink size={14} />
				Powered by song-request-queue
			</a>
		</div>
	);
}

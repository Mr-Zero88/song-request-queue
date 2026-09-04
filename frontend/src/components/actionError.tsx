import { signal } from "@preact/signals-react";
import * as stylex from "@stylexjs/stylex";
import { AlertCircle } from "lucide-react";

import Button from "@/components/ui/button.tsx";
import Card from "@/components/ui/card.tsx";

import { colors, fontSizes, space } from "../vars.stylex.ts";

const styles = stylex.create({
	row: {
		display: "flex",
		alignItems: "center",
		gap: space.sm,
	},
	icon: {
		color: colors.danger,
		flexShrink: 0,
	},
	text: {
		flex: 1,
		minWidth: 0,
		color: colors.primaryText,
		fontSize: fontSizes.sm,
	},
});

// Requests are fired without the caller awaiting them, so a failure has nowhere
// else to go — the interface would otherwise look identical to success. Shared
// by the guest view and the kiosk.
export const actionError = signal<string | null>(null);

export default function ActionError() {
	if (actionError.value == null) return null;

	return (
		<Card>
			<div {...stylex.props(styles.row)}>
				<AlertCircle size={16} {...stylex.props(styles.icon)} />
				<span {...stylex.props(styles.text)}>{actionError.value}</span>
				<Button
					variant="ghost"
					size="sm"
					onClick={() => (actionError.value = null)}
				>
					Dismiss
				</Button>
			</div>
		</Card>
	);
}

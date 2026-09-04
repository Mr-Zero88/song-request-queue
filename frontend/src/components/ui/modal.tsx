import * as stylex from "@stylexjs/stylex";
import type { ReactNode } from "react";

import { colors, radius, shadows, space } from "../../vars.stylex.ts";

type ModalProps = {
	open: boolean;
	onClose?: () => void;
	children: ReactNode;
};

const styles = stylex.create({
	backdrop: {
		position: "fixed",
		inset: 0,
		backgroundColor: "rgba(0, 0, 0, 0.5)",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		zIndex: 1000,
	},
	panel: {
		backgroundColor: colors.surface,
		borderRadius: radius.lg,
		boxShadow: shadows.lg,
		padding: space.lg,
		minWidth: "300px",
	},
});

export default function Modal({ open, onClose, children }: ModalProps) {
	if (!open) return null;

	return (
		<div {...stylex.props(styles.backdrop)} onClick={onClose}>
			<div
				{...stylex.props(styles.panel)}
				onClick={(e) => e.stopPropagation()}
			>
				{children}
			</div>
		</div>
	);
}

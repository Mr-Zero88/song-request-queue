import * as stylex from "@stylexjs/stylex";
import { Check, X } from "lucide-react";

import Button from "@/components/ui/button.tsx";
import Modal from "@/components/ui/modal.tsx";
import { space } from "../vars.stylex.ts";

const styles = stylex.create({
	buttonRow: {
		display: "flex",
		justifyContent: "flex-end",
		gap: space.sm,
		marginTop: space.lg,
	},
});

type ConfirmPopupProps = {
	open: boolean;
	message: string;
	onConfirm: () => void;
	onCancel: () => void;
};

export default function ConfirmPopup({
	open,
	message,
	onConfirm,
	onCancel,
}: ConfirmPopupProps) {
	return (
		<Modal open={open} onClose={onCancel}>
			<p>{message}</p>

			<div {...stylex.props(styles.buttonRow)}>
				<Button variant="secondary" onClick={onCancel}>
					<X size={14} />
					Cancel
				</Button>
				<Button variant="primary" onClick={onConfirm}>
					<Check size={14} />
					OK
				</Button>
			</div>
		</Modal>
	);
}

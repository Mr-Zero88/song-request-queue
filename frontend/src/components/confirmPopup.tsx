import * as stylex from "@stylexjs/stylex";

const styles = stylex.create({
	backdrop: {
		position: "fixed",
		inset: 0,
		backgroundColor: "rgba(0,0,0,0.5)",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
	},

	popup: {
		backgroundColor: "white",
		padding: "1rem",
		borderRadius: "12px",
		minWidth: "300px",
		boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
	},

	buttonRow: {
		display: "flex",
		justifyContent: "flex-end",
		gap: "0.5rem",
		marginTop: "1rem",
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
	if (!open) return null;

	return (
		<div {...stylex.props(styles.backdrop)} onClick={onCancel}>
			<div {...stylex.props(styles.popup)} onClick={(e) => e.stopPropagation()}>
				<p>{message}</p>

				<div {...stylex.props(styles.buttonRow)}>
					<button onClick={onCancel}>Cancel</button>
					<button onClick={onConfirm}>OK</button>
				</div>
			</div>
		</div>
	);
}

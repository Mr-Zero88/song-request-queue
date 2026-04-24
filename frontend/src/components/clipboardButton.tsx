import { useState, type ButtonHTMLAttributes } from "react";
import ConfirmPopup from "./confirmPopup";

type ClipboardButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
	onValueChange?: (value: string) => void;
};

export default function ClipboardButton({
	children,
	onValueChange,
	...rest
}: ClipboardButtonProps) {
	const [open, setOpen] = useState(false);

	const getClipboard = async (): Promise<string> => {
		try {
			return await navigator.clipboard.readText();
		} catch (e) {
			console.error("Failed to read clipboard:", e);
			return "";
		}
	};

	const handleConfirm = async () => {
		setOpen(false);

		const value = await getClipboard();
		if (!value) return;

		onValueChange?.(value);

		await navigator.clipboard.writeText(""); // clear clipboard
	};

	return (
		<>
			<ConfirmPopup
				open={open}
				message="Add clipboard link to queue?"
				onCancel={() => setOpen(false)}
				onConfirm={handleConfirm}
			/>

			<button {...rest} onClick={() => setOpen(true)}>
				{children}
			</button>
		</>
	);
}

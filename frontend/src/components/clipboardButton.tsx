import type { ButtonHTMLAttributes } from "react";
import { useSignal } from "@preact/signals-react";

import ConfirmPopup from "@/components/confirmPopup.tsx";
import Button from "@/components/ui/button.tsx";

type ClipboardButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
	onValueChange?: (value: string) => void;
};

export default function ClipboardButton({
	children,
	onValueChange,
	...rest
}: ClipboardButtonProps) {
	const open = useSignal(false);

	const getClipboard = async (): Promise<string> => {
		try {
			return await navigator.clipboard.readText();
		} catch (e) {
			console.error("Failed to read clipboard:", e);
			return "";
		}
	};

	const handleConfirm = async () => {
		open.value = false;

		const value = await getClipboard();
		if (!value) return;

		onValueChange?.(value);
	};

	return (
		<>
			<ConfirmPopup
				open={open.value}
				message="Add clipboard link to queue?"
				onCancel={() => (open.value = false)}
				onConfirm={() => void handleConfirm()}
			/>

			<Button {...rest} onClick={() => (open.value = true)}>
				{children}
			</Button>
		</>
	);
}

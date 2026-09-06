import { useSignal } from "@preact/signals-react";
import { useEffect, useRef } from "react";
import * as stylex from "@stylexjs/stylex";
import { Clipboard, Search } from "lucide-react";

import { getYouTubeVideoId } from "@/api/youtube";
import { useVideoMetadata } from "@/hooks/useVideoMetadata.ts";
import Card from "@/components/ui/card.tsx";
import YoutubeThumbnail from "@/components/youtubeThumbnail.tsx";
import ConfirmPopup from "@/components/confirmPopup.tsx";

import { colors, fontSizes, fontWeights, radius, space } from "../vars.stylex.ts";
import { notify } from "@/components/ui/toast.tsx";

type SearchBarProps = {
	onSelect: (link: string) => void;
};

const styles = stylex.create({
	root: {
		position: "relative",
	},
	input: {
		width: "100%",
		boxSizing: "border-box",
		fontSize: fontSizes.md,
		padding: `${space.md} ${space.lg} ${space.md} 2.75rem`,
		minHeight: "2.75rem",
		borderRadius: radius.xl,
		borderStyle: "solid",
		borderWidth: "1px",
		borderColor: colors.border,
		backgroundColor: colors.surface,
		color: colors.primaryText,
		outlineStyle: "none",
		":focus": {
			borderColor: colors.accent,
			boxShadow: `0 0 0 3px color-mix(in srgb, ${colors.accent} 30%, transparent)`,
		},
	},
	searchIcon: {
		position: "absolute",
		left: space.md,
		top: "50%",
		transform: "translateY(-50%)",
		color: colors.secondaryText,
		pointerEvents: "none",
	},
	// Overlays the content below instead of pushing it down the page.
	dropdown: {
		position: "absolute",
		top: "100%",
		left: 0,
		right: 0,
		marginTop: space.sm,
		zIndex: 20,
	},
	hint: {
		color: colors.secondaryText,
		fontSize: fontSizes.sm,
		padding: `${space.sm} ${space.xs}`,
		margin: 0,
	},
	result: {
		display: "flex",
		gap: space.md,
		alignItems: "center",
		padding: space.md,
		minHeight: "2.75rem",
		borderRadius: radius.md,
		cursor: "pointer",
		backgroundColor: "transparent",
		borderStyle: "none",
		width: "100%",
		textAlign: "left",
		boxSizing: "border-box",
	},
	resultDesc: {
		display: "flex",
		flexDirection: "column",
		gap: space.xs,
		minWidth: 0,
	},
	resultTitle: {
		color: colors.primaryText,
		fontSize: fontSizes.md,
		fontWeight: fontWeights.semibold,
		// Real titles run long; two lines beat an ellipsis at the first word.
		display: "-webkit-box",
		WebkitBoxOrient: "vertical",
		WebkitLineClamp: 2,
		overflow: "hidden",
	},
	resultAuthor: {
		color: colors.secondaryText,
		fontSize: fontSizes.sm,
		overflow: "hidden",
		textOverflow: "ellipsis",
		whiteSpace: "nowrap",
	},
	clipboardHint: {
		display: "flex",
		alignItems: "center",
		gap: space.xs,
		color: colors.accent,
		fontSize: fontSizes.sm,
		cursor: "pointer",
		padding: `${space.sm} ${space.xs}`,
		minHeight: "2.25rem",
		borderStyle: "none",
		backgroundColor: "transparent",
	},
});

export default function SearchBar({ onSelect }: SearchBarProps) {
	const active = useSignal(false);
	const query = useSignal("");
	const confirmClipboard = useSignal(false);
	const rootRef = useRef<HTMLDivElement>(null);

	// Escape and picking a result aren't the only ways out of the dropdown —
	// without this it stays open for the rest of the session once focused.
	useEffect(() => {
		const handlePointerDown = (e: PointerEvent) => {
			if (!rootRef.current?.contains(e.target as Node)) {
				active.value = false;
			}
		};

		document.addEventListener("pointerdown", handlePointerDown);
		return () => document.removeEventListener("pointerdown", handlePointerDown);
	}, [active]);

	const videoId = getYouTubeVideoId(query.value);
	const metadata = useVideoMetadata(query.value);
	const hasResult = query.value.length > 0 && !(videoId instanceof Error);

	const select = (link: string) => {
		onSelect(link);
		query.value = "";
		active.value = false;
	};

	const readClipboardLink = async () => {
		try {
			const value = await navigator.clipboard.readText();
			if (value) query.value = value;
		} catch {
			notify("Couldn't read the clipboard. Paste the link into the field instead.");
		}
	};

	return (
		<div ref={rootRef} {...stylex.props(styles.root)}>
			<ConfirmPopup
				open={confirmClipboard.value}
				message="Use clipboard content as search?"
				onCancel={() => (confirmClipboard.value = false)}
				onConfirm={() => {
					confirmClipboard.value = false;
					void readClipboardLink();
				}}
			/>

			<Search size={18} {...stylex.props(styles.searchIcon)} />

			<input
				{...stylex.props(styles.input)}
				type="text"
				placeholder="Search or paste a YouTube link..."
				value={query.value}
				onFocus={() => (active.value = true)}
				onChange={(e) => (query.value = e.target.value)}
				onKeyDown={(e) => {
					if (e.key === "Enter" && hasResult) select(query.value);
					if (e.key === "Escape") active.value = false;
				}}
			/>

			{active.value ? (
				<div {...stylex.props(styles.dropdown)}>
					<Card>
						{!hasResult ? (
							<p {...stylex.props(styles.hint)}>
								Paste a YouTube link to find your song.
							</p>
						) : metadata.value ? (
							<button
								type="button"
								onClick={() => select(query.value)}
								{...stylex.props(styles.result)}
							>
								<YoutubeThumbnail
									youtubeURL={query.value}
									alt={metadata.value.title}
								/>
								<div {...stylex.props(styles.resultDesc)}>
									<span {...stylex.props(styles.resultTitle)}>
										{metadata.value.title}
									</span>
									<span {...stylex.props(styles.resultAuthor)}>
										{metadata.value.author_name}
									</span>
								</div>
							</button>
						) : (
							<p {...stylex.props(styles.hint)}>Loading preview...</p>
						)}

						<button
							type="button"
							onClick={() => (confirmClipboard.value = true)}
							{...stylex.props(styles.clipboardHint)}
						>
							<Clipboard size={14} />
							Use link from clipboard
						</button>
					</Card>
				</div>
			) : null}
		</div>
	);
}

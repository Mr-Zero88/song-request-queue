import { media } from "../breakpoints.stylex.ts";
import { getThumbnail, type ThumbnailQuality } from "@/api/youtube";
import { colors, shadows, radius } from "../vars.stylex.ts";
import * as stylex from "@stylexjs/stylex";
import { Music } from "lucide-react";

type YoutubeThumbnailProps = React.ImgHTMLAttributes<HTMLImageElement> & {
	youtubeURL: string;
	size?: "default" | "hero" | "compact" | "compactHero";
};


const styles = stylex.create({
	thumbnail: {
		borderRadius: radius.md,
		minWidth: { default: "12rem", [media.narrow]: "6rem" },
		aspectRatio: "16/9",
		objectFit: "cover",
		display: "block",
		boxShadow: shadows.md,
	},
	hero: {
		minWidth: "16rem",
		width: "100%",
		maxWidth: "24rem",
	},
	compact: {
		minWidth: { default: "13rem", [media.tiny]: "8.5rem" },
		width: { default: "13rem", [media.tiny]: "8.5rem" },
		maxWidth: { default: "13rem", [media.tiny]: "8.5rem" },
	},
	compactHero: {
		minWidth: { default: "14.5rem", [media.tiny]: "9.5rem" },
		width: { default: "14.5rem", [media.tiny]: "9.5rem" },
		maxWidth: { default: "14.5rem", [media.tiny]: "9.5rem" },
	},
	placeholder: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: colors.background,
		color: colors.secondaryText,
	},
});

const SIZE_STYLES = {
	default: null,
	hero: styles.hero,
	compact: styles.compact,
	compactHero: styles.compactHero,
} as const;

// The two large sizes are rendered well above 320px wide, so they get the
// bigger poster; the rest would only pay for pixels they scale away.
const SIZE_QUALITY: Record<string, ThumbnailQuality> = {
	default: "medium",
	hero: "high",
	compact: "medium",
	compactHero: "high",
};

export default function YoutubeThumbnail({
	youtubeURL,
	alt,
	size = "default",
	...rest
}: YoutubeThumbnailProps) {
	const thumbnailSrc = getThumbnail(youtubeURL, SIZE_QUALITY[size]);

	// A link we can't parse has no poster to show; render a neutral tile rather
	// than a broken image that collapses the row around it.
	if (thumbnailSrc == null) {
		return (
			<div
				role="img"
				aria-label={alt ?? "No thumbnail available"}
				{...stylex.props(styles.thumbnail, SIZE_STYLES[size], styles.placeholder)}
			>
				<Music size={20} />
			</div>
		);
	}

	return (
		<img
			loading="lazy"
			decoding="async"
			{...rest}
			{...stylex.props(styles.thumbnail, SIZE_STYLES[size])}
			src={thumbnailSrc}
			alt={alt ?? "Video thumbnail"}
		/>
	);
}

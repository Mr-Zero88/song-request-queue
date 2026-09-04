import { getThumbnail } from "@/api/youtube";
import { shadows, radius } from "../vars.stylex.ts";
import * as stylex from "@stylexjs/stylex";

type YoutubeThumbnailProps = React.ImgHTMLAttributes<HTMLImageElement> & {
	youtubeURL: string;
	size?: "default" | "hero" | "compact" | "compactHero";
};

const NARROW = "@media (max-width: 639px)";
const TINY = "@media (max-width: 479px)";

const styles = stylex.create({
	thumbnail: {
		borderRadius: radius.md,
		minWidth: { default: "12rem", [NARROW]: "6rem" },
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
		minWidth: { default: "13rem", [TINY]: "8.5rem" },
		width: { default: "13rem", [TINY]: "8.5rem" },
		maxWidth: { default: "13rem", [TINY]: "8.5rem" },
	},
	compactHero: {
		minWidth: { default: "14.5rem", [TINY]: "9.5rem" },
		width: { default: "14.5rem", [TINY]: "9.5rem" },
		maxWidth: { default: "14.5rem", [TINY]: "9.5rem" },
	},
});

const SIZE_STYLES = {
	default: null,
	hero: styles.hero,
	compact: styles.compact,
	compactHero: styles.compactHero,
} as const;

export default function YoutubeThumbnail({
	youtubeURL,
	alt,
	size = "default",
	...rest
}: YoutubeThumbnailProps) {
	const thumbnailSrc = getThumbnail(youtubeURL);

	return (
		<img
			{...rest}
			{...stylex.props(styles.thumbnail, SIZE_STYLES[size])}
			src={thumbnailSrc}
			alt={alt ?? "Video thumbnail"}
		/>
	);
}

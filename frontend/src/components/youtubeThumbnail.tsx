import { getThumbnail } from "@/api/youtube";
import { shadows, radius } from "../vars.stylex.ts";
import * as stylex from "@stylexjs/stylex";

type YoutubeThumbnailProps = React.HTMLAttributes<HTMLImageElement> & {
	youtubeURL: string;
};

const styles = stylex.create({
	thumbnail: {
		borderRadius: radius.md,
		minWidth: "12rem",
		aspectRatio: "16/9",
		objectFit: "cover",
		display: "block",
		boxShadow: shadows.md,
	},
});

export default function YoutubeThumbnail({
	youtubeURL,
	...rest
}: YoutubeThumbnailProps) {
	const thumbnailSrc = getThumbnail(youtubeURL);

	return (
		<img {...rest} {...stylex.props(styles.thumbnail)} src={thumbnailSrc} />
	);
}

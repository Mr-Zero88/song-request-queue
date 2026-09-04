export function getYouTubeVideoId(url: string): string | Error {
	const regex =
		/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

	const match = url.match(regex);
	return match ? match[1] : new Error("invalid youtube url");
}

export type NoEmbedResponse = {
	title: string;
	author_name: string;
	author_url: string;
	type: string;
	height: number;
	width: number;
	version: string;
	provider_name: string;
	provider_url: string;
	thumbnail_url: string;
	thumbnail_width: number;
	thumbnail_height: number;
	html: string;
};

export async function getVideoMetadata(
	videoId: string,
): Promise<NoEmbedResponse> {
	const url = `https://www.youtube.com/watch?v=${videoId}`;
	const endpoint = `https://noembed.com/embed?format=json&url=${encodeURIComponent(url)}`;

	const res = await fetch(endpoint);

	if (!res.ok) {
		throw new Error(`HTTP error: ${res.status}`);
	}

	const data: NoEmbedResponse = await res.json();
	return data;
}

// "default" is 120x90 and looks soft at every size we render; the two larger
// posters cost nothing extra and are what the layout actually needs.
export type ThumbnailQuality = "medium" | "high";

const THUMBNAIL_FILES: Record<ThumbnailQuality, string> = {
	medium: "mqdefault.jpg", // 320x180
	high: "hqdefault.jpg", // 480x360
};

// Returns null for anything that isn't a YouTube link, so callers can fall back
// to a placeholder. (getYouTubeVideoId reports failure with an Error *object*,
// which is truthy — a plain falsy check never catches it.)
export function getThumbnail(
	url: string,
	quality: ThumbnailQuality = "medium",
): string | null {
	const videoId = getYouTubeVideoId(url);

	if (videoId instanceof Error) {
		return null;
	}

	return `https://img.youtube.com/vi/${videoId}/${THUMBNAIL_FILES[quality]}`;
}

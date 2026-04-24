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

export function getThumbnail(url: string): string {
	const videoId = getYouTubeVideoId(url);

	if (!videoId) {
		throw new Error("Invalid YouTube URL");
	}

	return `https://img.youtube.com/vi/${videoId}/1.jpg`;
}

import { useSignal, type Signal } from "@preact/signals-react";
import { useEffect } from "react";

import {
	getVideoMetadata,
	getYouTubeVideoId,
	type NoEmbedResponse,
} from "@/api/youtube";

export function useVideoMetadata(link: string): Signal<NoEmbedResponse | null> {
	const metadata = useSignal<NoEmbedResponse | null>(null);

	useEffect(() => {
		const videoId = getYouTubeVideoId(link);

		if (videoId instanceof Error) {
			metadata.value = null;
			return;
		}

		let cancelled = false;
		getVideoMetadata(videoId)
			.then((m) => {
				if (!cancelled) metadata.value = m;
			})
			.catch(() => {
				if (!cancelled) metadata.value = null;
			});

		return () => {
			cancelled = true;
		};
	}, [link, metadata]);

	return metadata;
}

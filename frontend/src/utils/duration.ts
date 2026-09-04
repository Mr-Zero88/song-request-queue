// No real video-duration data source is wired up yet (would need the YouTube
// Data API). Until then, derive a stable fake duration from the song id so it
// stays consistent across renders/reloads instead of jumping around.
export function getMockDurationSeconds(seed: string): number {
	let hash = 0;
	for (let i = 0; i < seed.length; i++) {
		hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
	}
	return 120 + (hash % 181); // 2:00–5:00
}

export function formatDuration(totalSeconds: number): string {
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = Math.floor(totalSeconds % 60);
	return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

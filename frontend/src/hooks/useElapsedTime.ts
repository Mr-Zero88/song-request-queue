import { useSignal } from "@preact/signals-react";
import { useEffect } from "react";

function format(ms: number): string {
	const totalSeconds = Math.max(0, Math.floor(ms / 1000));
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;
	return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

/** Time since `startedAt` as m:ss, ticking every second. */
export function useElapsedTime(startedAt: number | undefined): string | null {
	const elapsed = useSignal(0);

	useEffect(() => {
		if (startedAt == null) return;

		const tick = () => (elapsed.value = Date.now() - startedAt);
		tick();
		const interval = setInterval(tick, 1000);

		return () => clearInterval(interval);
	}, [startedAt, elapsed]);

	if (startedAt == null) return null;
	return format(elapsed.value);
}

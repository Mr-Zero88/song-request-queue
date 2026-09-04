import { useSignal } from "@preact/signals-react";
import { useEffect } from "react";

import { kioskVoteCooldownMs } from "@/api/api.ts";

/**
 * Seconds left before the kiosk may vote again; 0 when voting is allowed.
 *
 * Always 0 outside the kiosk, so the guest view is unaffected. The buttons read
 * this to disable themselves and count down, rather than letting someone tap
 * and only then be told to wait.
 */
export function useVoteCooldown(): number {
	const remaining = useSignal(Math.ceil(kioskVoteCooldownMs() / 1000));

	useEffect(() => {
		const tick = () => {
			remaining.value = Math.ceil(kioskVoteCooldownMs() / 1000);
		};

		tick();
		const interval = setInterval(tick, 1000);

		return () => clearInterval(interval);
	}, [remaining]);

	return remaining.value;
}

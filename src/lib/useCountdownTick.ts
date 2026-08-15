"use client";

import { useEffect, useState } from "react";

import {
  breakdownDuration,
  type CountdownBreakdown,
  remainingMsAt,
} from "@/lib/countdown";

/**
 * Ticks a countdown once a second from a baseline "ms remaining" as of `anchoredAt`
 * (computed by the server, or right after a save). Measures elapsed local time since
 * that anchor, never the client's absolute clock. `anchoredAt` must be shared by every
 * component ticking the same countdown — e.g. the header ticker and the expanded modal —
 * so a component that mounts later (like the modal, opened well after page load) still
 * reads the same in-sync value instead of restarting from the stale `msRemaining` as if
 * it had just been fetched.
 */
export function useCountdownTick(
  msRemaining: number,
  anchoredAt: number,
): CountdownBreakdown {
  const [displayMs, setDisplayMs] = useState(() =>
    remainingMsAt(msRemaining, anchoredAt, Date.now()),
  );

  useEffect(() => {
    function tick() {
      setDisplayMs(remainingMsAt(msRemaining, anchoredAt, Date.now()));
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [msRemaining, anchoredAt]);

  return breakdownDuration(displayMs);
}

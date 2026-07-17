"use client";

import { useEffect, useState } from "react";
import { breakdownDuration, type CountdownBreakdown } from "@/lib/countdown";

/**
 * Ticks a countdown once a second from a baseline "ms remaining" (computed by the server,
 * or right after a save). Re-anchors whenever `msRemaining` itself changes; between
 * anchors it only measures elapsed local time, never the client's absolute clock.
 */
export function useCountdownTick(msRemaining: number): CountdownBreakdown {
  const [displayMs, setDisplayMs] = useState(msRemaining);

  useEffect(() => {
    const startedAt = Date.now();
    function tick() {
      setDisplayMs(msRemaining - (Date.now() - startedAt));
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [msRemaining]);

  return breakdownDuration(displayMs);
}

import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

import { withSession } from "@/lib/api";
import { zonedTimeToUtc } from "@/lib/countdown";
import { setCountdown } from "@/lib/db";

function isValidTimeZone(value: unknown): value is string {
  if (typeof value !== "string" || !value) return false;
  try {
    new Intl.DateTimeFormat(undefined, { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

export const PATCH = withSession(async (_session, request: Request) => {
  const { year, month, day, hour, minute, timeZone, location, label } =
    await request.json();

  const parts = { year, month, day, hour, minute };
  const allPartsAreNumbers = Object.values(parts).every(
    (v) => typeof v === "number" && Number.isInteger(v),
  );
  if (!allPartsAreNumbers) {
    return NextResponse.json({ error: "Invalid date/time" }, { status: 400 });
  }
  if (!isValidTimeZone(timeZone)) {
    return NextResponse.json({ error: "Invalid time zone" }, { status: 400 });
  }
  if (typeof label !== "string" || !label.trim()) {
    return NextResponse.json({ error: "Invalid label" }, { status: 400 });
  }
  if (location !== null && typeof location !== "string") {
    return NextResponse.json({ error: "Invalid location" }, { status: 400 });
  }

  const targetAt = zonedTimeToUtc(parts, timeZone);
  if (Number.isNaN(targetAt.getTime())) {
    return NextResponse.json({ error: "Invalid date/time" }, { status: 400 });
  }

  await setCountdown(
    targetAt,
    timeZone,
    location?.trim() || null,
    label.trim(),
  );
  // { expire: 0 }, not the "max" stale-while-revalidate profile: a Route Handler responding
  // to this exact save needs the countdown to read fresh on the very next request, not after
  // one more stale serve — see Next's revalidateTag docs on immediate-expiration Route Handlers.
  revalidateTag("countdown", { expire: 0 });
  return NextResponse.json({ ok: true });
});

import { NextResponse } from "next/server";
import { setCountdown } from "@/lib/db";
import { withSession } from "@/lib/api";
import { zonedTimeToUtc } from "@/lib/countdown";

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
  const { year, month, day, hour, minute, timeZone, location, label } = await request.json();

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

  await setCountdown(targetAt, timeZone, location?.trim() || null, label.trim());
  return NextResponse.json({ ok: true });
});

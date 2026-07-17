import { NextResponse } from "next/server";
import { resetAllAnswered } from "@/lib/db";
import { withSession } from "@/lib/api";

export const POST = withSession(async () => {
  await resetAllAnswered();
  return NextResponse.json({ ok: true });
});

import { NextResponse } from "next/server";

import { withSession } from "@/lib/api";
import { resetAllAnswered } from "@/lib/db";

export const POST = withSession(async () => {
  await resetAllAnswered();
  return NextResponse.json({ ok: true });
});

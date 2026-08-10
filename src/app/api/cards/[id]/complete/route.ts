import { NextResponse } from "next/server";
import { incrementCardCompletedByRef } from "@/lib/db";
import { withSession } from "@/lib/api";
import { parseCardRef } from "@/lib/id";

export const PATCH = withSession(
  async (_session, _request: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const ref = parseCardRef(id);
    if (ref === null) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    await incrementCardCompletedByRef(ref);
    return NextResponse.json({ ok: true });
  },
);

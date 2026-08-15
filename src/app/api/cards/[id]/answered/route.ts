import { NextResponse } from "next/server";

import { withSession } from "@/lib/api";
import { setCardAnsweredByRef } from "@/lib/db";
import { parseCardRef } from "@/lib/id";

export const PATCH = withSession(
  async (
    _session,
    request: Request,
    { params }: { params: Promise<{ id: string }> },
  ) => {
    const { id } = await params;
    const ref = parseCardRef(id);
    if (ref === null) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const { answered } = await request.json();
    if (typeof answered !== "boolean") {
      return NextResponse.json(
        { error: "Invalid answered value" },
        { status: 400 },
      );
    }

    await setCardAnsweredByRef(ref, answered);
    return NextResponse.json({ ok: true });
  },
);

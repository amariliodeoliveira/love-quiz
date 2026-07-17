import { NextResponse } from "next/server";
import { setCardAnswered } from "@/lib/db";
import { withSession } from "@/lib/api";
import { parseId } from "@/lib/id";

export const PATCH = withSession(
  async (_session, request: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const cardId = parseId(id);
    if (cardId === null) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const { answered } = await request.json();
    if (typeof answered !== "boolean") {
      return NextResponse.json({ error: "Invalid answered value" }, { status: 400 });
    }

    await setCardAnswered(cardId, answered);
    return NextResponse.json({ ok: true });
  },
);

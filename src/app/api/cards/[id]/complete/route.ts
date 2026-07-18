import { NextResponse } from "next/server";
import { incrementDareCompleted } from "@/lib/db";
import { withSession } from "@/lib/api";
import { parseId } from "@/lib/id";

export const PATCH = withSession(
  async (_session, _request: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const cardId = parseId(id);
    if (cardId === null) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    await incrementDareCompleted(cardId);
    return NextResponse.json({ ok: true });
  },
);

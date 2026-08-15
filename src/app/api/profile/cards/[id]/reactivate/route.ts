import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { withSession } from "@/lib/api";
import { reactivateCard } from "@/lib/db";
import { parseId } from "@/lib/id";
import { GAME_PATH } from "@/lib/routes";

export const PATCH = withSession(
  async (
    session,
    _request: Request,
    { params }: { params: Promise<{ id: string }> },
  ) => {
    const { id } = await params;
    const cardId = parseId(id);
    if (cardId === null) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const reactivated = await reactivateCard(cardId, session);
    if (!reactivated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    revalidatePath(GAME_PATH);
    return NextResponse.json({ ok: true });
  },
);

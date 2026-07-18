import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { reactivateCard } from "@/lib/db";
import { withSession } from "@/lib/api";
import { GAME_PATH } from "@/lib/routes";
import { parseId } from "@/lib/id";

export const PATCH = withSession(
  async (session, _request: Request, { params }: { params: Promise<{ id: string }> }) => {
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

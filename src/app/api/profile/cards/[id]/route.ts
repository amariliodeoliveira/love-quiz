import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { withSession } from "@/lib/api";
import { cardFormSchema } from "@/lib/card";
import { deleteCard, updateCard } from "@/lib/db";
import { parseId } from "@/lib/id";
import { GAME_PATH } from "@/lib/routes";

export const PATCH = withSession(
  async (
    session,
    request: Request,
    { params }: { params: Promise<{ id: string }> },
  ) => {
    const { id } = await params;
    const cardId = parseId(id);
    if (cardId === null) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }
    const parsed = cardFormSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }
    const { level, question } = parsed.data;

    const updated = await updateCard(cardId, level, question, session);
    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    revalidatePath(GAME_PATH);
    return NextResponse.json({ ok: true });
  },
);

export const DELETE = withSession(
  async (
    session,
    request: Request,
    { params }: { params: Promise<{ id: string }> },
  ) => {
    const { id } = await params;
    const cardId = parseId(id);
    if (cardId === null) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const deleted = await deleteCard(cardId, session);
    if (!deleted) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    revalidatePath(GAME_PATH);
    return NextResponse.json({ ok: true });
  },
);

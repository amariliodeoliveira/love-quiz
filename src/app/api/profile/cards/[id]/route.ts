import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { deleteCard, updateCard } from "@/lib/db";
import { requireSession } from "@/lib/api";
import { LEVEL_META, type Level } from "@/data/cards";

const VALID_LEVELS = Object.keys(LEVEL_META) as Level[];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;

  const { id } = await params;
  const cardId = Number(id);
  if (!Number.isInteger(cardId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const { level, question } = await request.json();
  if (
    typeof question !== "string" ||
    !question.trim() ||
    !VALID_LEVELS.includes(level)
  ) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const updated = await updateCard(cardId, level, question.trim(), session);
  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  revalidatePath("/");
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;

  const { id } = await params;
  const cardId = Number(id);
  if (!Number.isInteger(cardId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const deleted = await deleteCard(cardId, session);
  if (!deleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  revalidatePath("/");
  return NextResponse.json({ ok: true });
}

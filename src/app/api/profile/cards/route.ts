import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getCardsForUser, createCard } from "@/lib/db";
import { requireSession } from "@/lib/api";
import { LEVEL_META, type Level } from "@/data/cards";

const VALID_LEVELS = Object.keys(LEVEL_META) as Level[];

export async function GET() {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;

  const cards = await getCardsForUser(session);
  return NextResponse.json({ cards });
}

export async function POST(request: Request) {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;

  const { level, question } = await request.json();

  if (
    typeof question !== "string" ||
    !question.trim() ||
    !VALID_LEVELS.includes(level)
  ) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const card = await createCard(level, question.trim(), session.userId);
  revalidatePath("/");
  return NextResponse.json({ card });
}

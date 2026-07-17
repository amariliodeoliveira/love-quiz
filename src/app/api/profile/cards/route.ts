import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getCardsForUser, createCard } from "@/lib/db";
import { withSession } from "@/lib/api";
import { ALL_LEVELS } from "@/data/cards";
import { GAME_PATH } from "@/lib/routes";

export const GET = withSession(async (session) => {
  const cards = await getCardsForUser(session);
  return NextResponse.json({ cards });
});

export const POST = withSession(async (session, request: Request) => {
  const { level, question } = await request.json();

  if (
    typeof question !== "string" ||
    !question.trim() ||
    !ALL_LEVELS.includes(level)
  ) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const card = await createCard(level, question.trim(), session.userId);
  revalidatePath(GAME_PATH);
  return NextResponse.json({ card });
});

import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { withSession } from "@/lib/api";
import { cardFormSchema } from "@/lib/card";
import { createCard, getCardsForUser } from "@/lib/db";
import { GAME_PATH } from "@/lib/routes";

export const GET = withSession(async (session) => {
  const cards = await getCardsForUser(session);
  return NextResponse.json({ cards });
});

export const POST = withSession(async (session, request: Request) => {
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

  const card = await createCard(level, question, session.userId);
  revalidatePath(GAME_PATH);
  return NextResponse.json({ card });
});

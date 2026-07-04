import { NextResponse } from "next/server";
import { getAllCards, createCard } from "@/lib/db";
import { isValidSessionCookie, COOKIE_NAME } from "@/lib/auth";
import { cookies } from "next/headers";

async function requireAuth() {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(COOKIE_NAME)?.value;
  return isValidSessionCookie(cookie);
}

export async function GET() {
  if (!(await requireAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const cards = await getAllCards();
  return NextResponse.json({ cards });
}

export async function POST(request: Request) {
  if (!(await requireAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { level, question } = await request.json();

  if (
    typeof level !== "string" ||
    typeof question !== "string" ||
    !question.trim()
  ) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const card = await createCard(
    level as "1" | "2" | "3" | "dare",
    question.trim(),
  );
  return NextResponse.json({ card });
}

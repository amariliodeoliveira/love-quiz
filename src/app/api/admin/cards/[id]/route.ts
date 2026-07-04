import { NextResponse } from "next/server";
import { deleteCard } from "@/lib/db";
import { isValidSessionCookie, COOKIE_NAME } from "@/lib/auth";
import { cookies } from "next/headers";

async function requireAuth() {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(COOKIE_NAME)?.value;
  return isValidSessionCookie(cookie);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await requireAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  await deleteCard(Number(id));
  return NextResponse.json({ ok: true });
}

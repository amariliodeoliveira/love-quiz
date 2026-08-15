// Creates/removes a throwaway user directly in the database for manual or
// automated visual QA (e.g. screenshotting authenticated pages), without ever
// setting a real password. See .claude/database-guidelines.md for the why.
//
// Usage:
//   node --env-file=.env.local scripts/qa-test-user.mjs create
//   node --env-file=.env.local scripts/qa-test-user.mjs cleanup
//
// `create` prints a JSON line with the new user id and a ready-to-use session
// cookie value (for the `admin_session` cookie) — no login flow involved.

import { createHmac } from "node:crypto";

import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.POSTGRES_URL, { fullResults: true });

const USERNAME = "_qa_visual_test";

function sign(value, secret) {
  return createHmac("sha256", secret).update(value).digest("hex");
}

function createSessionCookieValue(session, secret) {
  const encoded = Buffer.from(JSON.stringify(session)).toString("base64url");
  return `${encoded}.${sign(encoded, secret)}`;
}

async function create() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret)
    throw new Error(
      "ADMIN_SESSION_SECRET is not set (run with --env-file=.env.local)",
    );

  await sql`DELETE FROM users WHERE username = ${USERNAME};`;

  const { rows } = await sql`
    INSERT INTO users (username, display_name, password_hash, role, avatar_color, failed_attempts, locked_until)
    VALUES (${USERNAME}, ${USERNAME}, NULL, 'user', 'pink', 0, NULL)
    RETURNING id;
  `;
  const userId = rows[0].id;
  const cookie = createSessionCookieValue(
    { userId, username: USERNAME, role: "user" },
    secret,
  );

  console.log(JSON.stringify({ userId, username: USERNAME, cookie }));
}

async function cleanup() {
  const { rows } =
    await sql`SELECT id FROM users WHERE username = ${USERNAME};`;
  if (rows.length === 0) {
    console.log("no test user found, nothing to clean up");
    return;
  }
  const userId = rows[0].id;
  await sql`DELETE FROM cards WHERE user_id = ${userId};`;
  await sql`DELETE FROM users WHERE id = ${userId};`;
  console.log(`cleaned up user ${userId}`);
}

const command = process.argv[2];
if (command === "create") await create();
else if (command === "cleanup") await cleanup();
else {
  console.error(
    "Usage: node --env-file=.env.local scripts/qa-test-user.mjs <create|cleanup>",
  );
  process.exit(1);
}

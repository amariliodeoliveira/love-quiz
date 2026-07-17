export interface JsonResponse<T> {
  ok: boolean;
  data: T | null;
}

async function sendJson<T = unknown>(
  method: "POST" | "PATCH",
  url: string,
  body: unknown,
): Promise<JsonResponse<T>> {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  return { ok: res.ok, data };
}

export function postJson<T = unknown>(url: string, body: unknown) {
  return sendJson<T>("POST", url, body);
}

export function patchJson<T = unknown>(url: string, body: unknown) {
  return sendJson<T>("PATCH", url, body);
}

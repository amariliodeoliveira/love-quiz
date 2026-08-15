import { NextResponse } from "next/server";

import { withSession } from "@/lib/api";

interface OpenMeteoResult {
  name: string;
  admin1?: string;
  country?: string;
  timezone: string;
}

export interface GeocodeResult {
  label: string;
  timeZone: string;
}

// Proxies Open-Meteo's free, keyless geocoding API — it doesn't send CORS headers,
// so the browser can't call it directly; this route exists purely to work around that.
const GEOCODE_URL = "https://geocoding-api.open-meteo.com/v1/search";

export const GET = withSession(async (_session, request: Request) => {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] satisfies GeocodeResult[] });
  }

  const upstream = new URL(GEOCODE_URL);
  upstream.searchParams.set("name", query);
  upstream.searchParams.set("count", "5");
  upstream.searchParams.set("language", "en");
  upstream.searchParams.set("format", "json");

  const res = await fetch(upstream);
  if (!res.ok) {
    return NextResponse.json({ results: [] satisfies GeocodeResult[] });
  }

  const data: { results?: OpenMeteoResult[] } = await res.json();
  const results: GeocodeResult[] = (data.results ?? []).map((r) => ({
    label: [r.name, r.admin1, r.country].filter(Boolean).join(", "),
    timeZone: r.timezone,
  }));

  return NextResponse.json({ results });
});

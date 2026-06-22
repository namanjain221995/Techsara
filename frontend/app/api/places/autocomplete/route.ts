import { NextResponse } from "next/server";

// Server-side proxy for AWS Location Service autocomplete. The API key stays on
// the server (env) and is never shipped to the browser.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const REGION = process.env.AWS_LOCATION_REGION || "us-east-1";
const KEY = process.env.AWS_LOCATION_API_KEY || "";

type AwsResultItem = {
  PlaceId?: string;
  Title?: string;
  Address?: { Label?: string };
};

export async function POST(req: Request) {
  if (!KEY) {
    return NextResponse.json({ suggestions: [] }, { status: 200 });
  }

  const body = (await req.json().catch(() => ({}))) as { q?: string };
  const query = (body.q || "").trim();
  // AWS bills per request — don't fire on every keystroke for tiny inputs.
  if (query.length < 3) return NextResponse.json({ suggestions: [] });

  const url = `https://places.geo.${REGION}.amazonaws.com/v2/autocomplete?key=${encodeURIComponent(KEY)}`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        QueryText: query,
        MaxResults: 6,
        Filter: { IncludeCountries: ["USA"] },
        Language: "en",
      }),
    });
    if (!res.ok) return NextResponse.json({ suggestions: [] }, { status: 200 });
    const data = (await res.json()) as { ResultItems?: AwsResultItem[] };
    const suggestions = (data.ResultItems || [])
      .filter((it) => !!it.PlaceId)
      .map((it) => ({
        placeId: it.PlaceId as string,
        label: it.Title || it.Address?.Label || "",
      }))
      .filter((s) => s.label);
    return NextResponse.json({ suggestions });
  } catch {
    return NextResponse.json({ suggestions: [] }, { status: 200 });
  }
}

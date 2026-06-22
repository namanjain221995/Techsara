import { NextResponse } from "next/server";

// Server-side proxy for AWS Location Service GetPlace. Returns the structured
// address used to auto-fill the apply form. Key stays on the server.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const REGION = process.env.AWS_LOCATION_REGION || "us-east-1";
const KEY = process.env.AWS_LOCATION_API_KEY || "";

type AwsPlace = {
  Title?: string;
  Address?: {
    Label?: string;
    Country?: { Name?: string; Code2?: string };
    Region?: { Name?: string; Code?: string };
    Locality?: string;
    District?: string;
    PostalCode?: string;
    Street?: string;
    AddressNumber?: string;
  };
};

export async function GET(req: Request) {
  if (!KEY) return NextResponse.json({ error: "not configured" }, { status: 500 });

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "missing id" }, { status: 400 });

  const url = `https://places.geo.${REGION}.amazonaws.com/v2/place/${encodeURIComponent(id)}?key=${encodeURIComponent(KEY)}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return NextResponse.json({ error: "lookup failed" }, { status: 502 });
    const d = (await res.json()) as AwsPlace;
    const a = d.Address || {};
    const street = [a.AddressNumber, a.Street].filter(Boolean).join(" ");
    return NextResponse.json({
      label: a.Label || d.Title || "",
      street,
      city: a.Locality || a.District || "",
      state: a.Region?.Name || "", // full state name — matches the form's <select>
      stateCode: a.Region?.Code || "",
      // Drop the optional ZIP+4 suffix so the field holds a clean 5-digit zip.
      zip: (a.PostalCode || "").split("-")[0],
      country: a.Country?.Name || "",
    });
  } catch {
    return NextResponse.json({ error: "lookup failed" }, { status: 502 });
  }
}

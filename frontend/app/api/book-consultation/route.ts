import { NextRequest, NextResponse } from "next/server";

const UPSTREAM_URL =
  "https://757gmsi4bl.execute-api.us-east-1.amazonaws.com/api/book-consultation";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  try {
    const upstream = await fetch(UPSTREAM_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const text = await upstream.text();
    const contentType = upstream.headers.get("content-type") || "application/json";

    return new NextResponse(text, {
      status: upstream.status,
      headers: { "content-type": contentType },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upstream request failed";
    return NextResponse.json(
      { error: "Upstream request failed", detail: message },
      { status: 502 },
    );
  }
}

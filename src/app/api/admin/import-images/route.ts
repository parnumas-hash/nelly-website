import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/admin/auth";
import { importRemoteImagesAsMediaItems } from "@/lib/admin/import-remote-images";

export async function POST(request: NextRequest) {
  const session = await requirePermission("products:write");
  if (session instanceof NextResponse) return session;

  let body: { urls?: string[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const urls = Array.isArray(body.urls)
    ? body.urls.filter((url): url is string => typeof url === "string")
    : [];

  if (urls.length === 0) {
    return NextResponse.json({ error: "No image URLs provided." }, { status: 400 });
  }

  if (urls.length > 50) {
    return NextResponse.json(
      { error: "Import at most 50 image URLs per request." },
      { status: 400 }
    );
  }

  const results = await importRemoteImagesAsMediaItems(urls);
  const items = results.flatMap((result) => (result.item ? [result.item] : []));
  const errors = results.filter((result) => result.error);

  return NextResponse.json({
    items,
    errors,
  });
}

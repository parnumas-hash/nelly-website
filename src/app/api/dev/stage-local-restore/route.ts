import { readFile, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { NextResponse } from "next/server";

const STAGED_PATH = join(process.cwd(), "data", "staged-local-restore.json");

function isDevRestoreAllowed(): boolean {
  return process.env.NODE_ENV !== "production";
}

export async function GET() {
  if (!isDevRestoreAllowed()) {
    return NextResponse.json({ error: "Not available." }, { status: 404 });
  }

  try {
    const raw = await readFile(STAGED_PATH, "utf8");
    await unlink(STAGED_PATH).catch(() => undefined);
    return new NextResponse(raw, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return NextResponse.json({ error: "No staged restore." }, { status: 404 });
  }
}

export async function POST(request: Request) {
  if (!isDevRestoreAllowed()) {
    return NextResponse.json({ error: "Not available." }, { status: 404 });
  }

  try {
    const raw = await request.text();
    JSON.parse(raw);
    await writeFile(STAGED_PATH, raw, "utf8");
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid backup JSON." }, { status: 400 });
  }
}

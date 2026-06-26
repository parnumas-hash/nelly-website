import { NextResponse } from "next/server";
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; source?: string };
    const email = body.email?.trim().toLowerCase() ?? "";
    const source = body.source?.trim() || "homepage";

    if (!EMAIL_PATTERN.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        {
          error:
            "Newsletter signup is temporarily unavailable. Please try again later.",
        },
        { status: 503 }
      );
    }

    const client = createAdminClient();
    const { error } = await client.from("newsletter_subscribers").upsert(
      {
        email,
        source,
        subscribed_at: new Date().toISOString(),
      },
      { onConflict: "email" }
    );

    if (error) {
      if (error.message.includes("newsletter_subscribers")) {
        return NextResponse.json(
          {
            error:
              "Newsletter storage is not set up. Run supabase/schema.sql in Supabase SQL Editor.",
          },
          { status: 503 }
        );
      }
      throw new Error(error.message);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not subscribe.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  createAdminSessionToken,
  verifyAdminPassword,
} from "@/lib/admin/auth";
import {
  checkRateLimit,
  clearRateLimit,
  getClientIp,
} from "@/lib/admin/rate-limit";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rateLimit = checkRateLimit(`admin-login:${ip}`);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: `Too many login attempts. Try again in ${rateLimit.retryAfterSec} seconds.`,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.retryAfterSec ?? 60),
          },
        }
      );
    }

    const body = (await request.json()) as { password?: string };
    const password = body.password ?? "";

    if (!verifyAdminPassword(password)) {
      return NextResponse.json({ error: "Invalid password." }, { status: 401 });
    }

    clearRateLimit(`admin-login:${ip}`);

    const response = NextResponse.json({ ok: true });
    response.cookies.set(ADMIN_COOKIE, createAdminSessionToken(), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  } catch {
    return NextResponse.json({ error: "Login failed." }, { status: 400 });
  }
}

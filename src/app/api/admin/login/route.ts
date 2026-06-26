import { NextResponse } from "next/server";
import {
  setAdminSessionCookie,
  verifyAdminPasswordLegacy,
} from "@/lib/admin/auth";
import { getLegacySuperAdminSession } from "@/lib/admin/session-types";
import {
  authenticateAdminUser,
  countAdminUsers,
  ensureBootstrapSuperAdmin,
  userRecordToSession,
} from "@/lib/admin/users-store";
import { isSupabaseConfigured } from "@/lib/supabase/admin";
import {
  checkRateLimit,
  clearRateLimit,
  getClientIp,
} from "@/lib/admin/rate-limit";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const body = (await request.json()) as {
      username?: string;
      password?: string;
    };
    const username = body.username?.trim() ?? "";
    const password = body.password ?? "";
    const rateKey = `admin-login:${ip}:${username || "legacy"}`;
    const rateLimit = checkRateLimit(rateKey);

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

    if (isSupabaseConfigured()) {
      await ensureBootstrapSuperAdmin();
      const userCount = await countAdminUsers();

      if (username) {
        const user = await authenticateAdminUser(username, password);
        if (!user) {
          return NextResponse.json(
            { error: "Invalid username or password." },
            { status: 401 }
          );
        }

        clearRateLimit(rateKey);
        const response = NextResponse.json({
          ok: true,
          mustChangePassword: user.must_change_password,
        });
        setAdminSessionCookie(response, userRecordToSession(user));
        return response;
      }

      if (userCount > 0) {
        return NextResponse.json(
          { error: "Username and password are required." },
          { status: 401 }
        );
      }
    }

    if (!verifyAdminPasswordLegacy(password)) {
      return NextResponse.json({ error: "Invalid password." }, { status: 401 });
    }

    clearRateLimit(rateKey);
    const response = NextResponse.json({ ok: true, mustChangePassword: false });
    setAdminSessionCookie(response, getLegacySuperAdminSession());
    return response;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Login failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

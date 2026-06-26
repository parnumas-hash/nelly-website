import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  hasPermission,
  Permission,
} from "@/lib/admin/permissions";
import {
  ADMIN_COOKIE,
  createAdminSessionToken,
  getAdminSessionCookieOptions,
  parseAdminSessionToken,
  verifyAdminPasswordLegacy,
} from "@/lib/admin/session-node";
import { AdminSession } from "@/lib/admin/session-types";

export { ADMIN_COOKIE } from "@/lib/admin/session-node";

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  return parseAdminSessionToken(cookieStore.get(ADMIN_COOKIE)?.value);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  return (await getAdminSession()) !== null;
}

export async function requireAdminSession(): Promise<
  AdminSession | NextResponse
> {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  return session;
}

export async function requirePermission(
  permission: Permission
): Promise<AdminSession | NextResponse> {
  const session = await requireAdminSession();
  if (session instanceof NextResponse) return session;
  if (!hasPermission(session.permissions, permission)) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }
  return session;
}

export function setAdminSessionCookie(
  response: NextResponse,
  session: AdminSession
): void {
  response.cookies.set(
    ADMIN_COOKIE,
    createAdminSessionToken(session),
    getAdminSessionCookieOptions()
  );
}

export function clearAdminSessionCookie(response: NextResponse): void {
  response.cookies.set(ADMIN_COOKIE, "", {
    ...getAdminSessionCookieOptions(),
    maxAge: 0,
  });
}

export { verifyAdminPasswordLegacy as verifyAdminPasswordLegacy };

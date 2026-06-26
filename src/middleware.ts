import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  parseAdminSessionEdge,
} from "@/lib/admin/auth-edge";
import {
  getRequiredPermissionForPath,
  hasPermission,
} from "@/lib/admin/permissions";

const ADMIN_LOGIN = "/admin/login";
const ADMIN_CHANGE_PASSWORD = "/admin/change-password";

function isProtectedAdminPath(pathname: string): boolean {
  if (!pathname.startsWith("/admin")) return false;
  return pathname !== ADMIN_LOGIN;
}

function isProtectedCatalogWrite(pathname: string, method: string): boolean {
  if (method === "PUT" && pathname === "/api/catalog") return true;
  if (method === "POST" && pathname === "/api/catalog/restore") return true;
  return false;
}

function isProtectedAdminApi(pathname: string): boolean {
  return pathname.startsWith("/api/admin/users") ||
    pathname === "/api/admin/change-password";
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get(ADMIN_COOKIE)?.value;
  const session = await parseAdminSessionEdge(sessionToken);
  const authenticated = session !== null;

  if (isProtectedAdminPath(pathname) && !authenticated) {
    const loginUrl = new URL(ADMIN_LOGIN, request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (
    authenticated &&
    session?.mustChangePassword &&
    pathname.startsWith("/admin") &&
    pathname !== ADMIN_LOGIN &&
    pathname !== ADMIN_CHANGE_PASSWORD
  ) {
    return NextResponse.redirect(new URL(ADMIN_CHANGE_PASSWORD, request.url));
  }

  if (authenticated && isProtectedAdminPath(pathname)) {
    const required = getRequiredPermissionForPath(pathname);
    if (
      required &&
      session &&
      !hasPermission(session.permissions, required)
    ) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  if (
    (isProtectedCatalogWrite(pathname, request.method) ||
      isProtectedAdminApi(pathname)) &&
    !authenticated
  ) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/catalog",
    "/api/catalog/restore",
    "/api/admin/users/:path*",
    "/api/admin/change-password",
  ],
};

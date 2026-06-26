import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  verifyAdminSessionTokenEdge,
} from "@/lib/admin/auth-edge";

const ADMIN_LOGIN = "/admin/login";

function isProtectedAdminPath(pathname: string): boolean {
  if (!pathname.startsWith("/admin")) return false;
  return pathname !== ADMIN_LOGIN;
}

function isProtectedCatalogWrite(pathname: string, method: string): boolean {
  if (method === "PUT" && pathname === "/api/catalog") return true;
  if (method === "POST" && pathname === "/api/catalog/restore") return true;
  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get(ADMIN_COOKIE)?.value;
  const authenticated = await verifyAdminSessionTokenEdge(session);

  if (isProtectedAdminPath(pathname) && !authenticated) {
    const loginUrl = new URL(ADMIN_LOGIN, request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isProtectedCatalogWrite(pathname, request.method) && !authenticated) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/catalog", "/api/catalog/restore"],
};

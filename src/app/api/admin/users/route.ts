import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/admin/auth";
import {
  AdminRole,
  isAdminRole,
  normalizeRoles,
} from "@/lib/admin/permissions";
import {
  createAdminUser,
  listAdminUsers,
} from "@/lib/admin/users-store";

export async function GET() {
  const session = await requirePermission("users:manage");
  if (session instanceof NextResponse) return session;

  try {
    const users = await listAdminUsers();
    return NextResponse.json({ users });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not load users.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await requirePermission("users:manage");
  if (session instanceof NextResponse) return session;

  try {
    const body = (await request.json()) as {
      username?: string;
      display_name?: string;
      password?: string;
      roles?: string[];
      must_change_password?: boolean;
    };

    const roles = normalizeRoles(body.roles).filter((role): role is AdminRole =>
      isAdminRole(role)
    );

    const user = await createAdminUser(
      {
        username: body.username ?? "",
        display_name: body.display_name ?? "",
        password: body.password ?? "",
        roles,
        must_change_password: body.must_change_password,
      },
      session.legacy ? undefined : session.userId
    );

    return NextResponse.json({ user });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not create user.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

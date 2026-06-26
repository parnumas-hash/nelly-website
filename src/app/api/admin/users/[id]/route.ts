import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/admin/auth";
import {
  AdminRole,
  isAdminRole,
  normalizeRoles,
} from "@/lib/admin/permissions";
import {
  deleteAdminUser,
  getAdminUserById,
  toPublicUser,
  updateAdminUser,
} from "@/lib/admin/users-store";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const session = await requirePermission("users:manage");
  if (session instanceof NextResponse) return session;

  const { id } = await params;
  try {
    const user = await getAdminUserById(id);
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }
    return NextResponse.json({ user: toPublicUser(user) });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not load user.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const session = await requirePermission("users:manage");
  if (session instanceof NextResponse) return session;

  const { id } = await params;

  try {
    const body = (await request.json()) as {
      display_name?: string;
      roles?: string[];
      active?: boolean;
      must_change_password?: boolean;
    };

    const roles =
      body.roles !== undefined
        ? normalizeRoles(body.roles).filter((role): role is AdminRole =>
            isAdminRole(role)
          )
        : undefined;

    const user = await updateAdminUser(id, {
      display_name: body.display_name,
      roles,
      active: body.active,
      must_change_password: body.must_change_password,
    });

    return NextResponse.json({ user });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not update user.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const session = await requirePermission("users:manage");
  if (session instanceof NextResponse) return session;

  const { id } = await params;

  try {
    await deleteAdminUser(id, session.legacy ? undefined : session.userId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not delete user.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

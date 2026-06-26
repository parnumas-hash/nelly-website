import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/auth";
import {
  getAdminUserById,
  toPublicUser,
} from "@/lib/admin/users-store";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (session.legacy) {
    return NextResponse.json({
      user: {
        id: session.userId,
        username: session.username,
        display_name: session.displayName,
        roles: session.roles,
        permissions: session.permissions,
        active: true,
        must_change_password: false,
        legacy: true,
      },
    });
  }

  const user = await getAdminUserById(session.userId);
  if (!user || !user.active) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  return NextResponse.json({
    user: {
      ...toPublicUser(user),
      permissions: session.permissions,
    },
  });
}

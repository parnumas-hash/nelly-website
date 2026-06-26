import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/admin/auth";
import { resetAdminUserPassword } from "@/lib/admin/users-store";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  const session = await requirePermission("users:manage");
  if (session instanceof NextResponse) return session;

  const { id } = await params;

  try {
    const body = (await request.json()) as { password?: string };
    await resetAdminUserPassword(id, body.password ?? "");
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not reset password.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

import { NextResponse } from "next/server";
import { requireAdminSession, setAdminSessionCookie } from "@/lib/admin/auth";
import { changeOwnPassword } from "@/lib/admin/users-store";

export async function POST(request: Request) {
  const session = await requireAdminSession();
  if (session instanceof NextResponse) return session;

  if (session.legacy) {
    return NextResponse.json(
      { error: "Legacy admin sessions cannot change password here." },
      { status: 400 }
    );
  }

  try {
    const body = (await request.json()) as {
      current_password?: string;
      new_password?: string;
    };

    const nextSession = await changeOwnPassword(
      session.userId,
      body.current_password ?? "",
      body.new_password ?? ""
    );

    const response = NextResponse.json({ ok: true });
    setAdminSessionCookie(response, nextSession);
    return response;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not change password.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

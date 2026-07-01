import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/admin/auth";
import { listOrders } from "@/lib/orders/orders-store";

export async function GET() {
  const session = await requirePermission("orders:read");
  if (session instanceof NextResponse) return session;

  try {
    const orders = await listOrders();
    return NextResponse.json({ orders });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Could not load orders.",
      },
      { status: 500 }
    );
  }
}

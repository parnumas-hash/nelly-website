import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/admin/auth";
import { getOrderById, updateOrderStatus } from "@/lib/orders/orders-store";
import { OrderStatus } from "@/types/orders";

const STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "picking",
  "shipped",
  "cancelled",
];

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await requirePermission("orders:read");
  if (session instanceof NextResponse) return session;

  const { id } = await context.params;

  try {
    const order = await getOrderById(id);
    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }
    return NextResponse.json({ order });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Could not load order.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await requirePermission("orders:manage");
  if (session instanceof NextResponse) return session;

  const { id } = await context.params;
  let body: { status?: OrderStatus };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body.status || !STATUSES.includes(body.status)) {
    return NextResponse.json({ error: "Invalid order status." }, { status: 400 });
  }

  try {
    const order = await updateOrderStatus(id, body.status);
    return NextResponse.json({ order });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Could not update order.",
      },
      { status: 500 }
    );
  }
}

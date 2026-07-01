import { NextRequest, NextResponse } from "next/server";
import { createOrder } from "@/lib/orders/orders-store";
import { getShippingFee } from "@/lib/utils";
import { CreateOrderRequestBody } from "@/types/orders";

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: NextRequest) {
  let body: CreateOrderRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const customerName = body.customerName?.trim() ?? "";
  const customerEmail = body.customerEmail?.trim() ?? "";
  const customerPhone = body.customerPhone?.trim() ?? "";
  const shippingAddress = body.shippingAddress?.trim() ?? "";
  const items = Array.isArray(body.items) ? body.items : [];

  if (!customerName || !customerEmail || !customerPhone || !shippingAddress) {
    return NextResponse.json(
      { error: "Customer name, email, phone, and shipping address are required." },
      { status: 400 }
    );
  }

  if (!isValidEmail(customerEmail)) {
    return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
  }

  if (items.length === 0) {
    return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
  }

  const normalizedItems = items
    .map((item) => ({
      productId: String(item.productId ?? ""),
      productName: String(item.productName ?? ""),
      productSlug: String(item.productSlug ?? ""),
      variantId: item.variantId ? String(item.variantId) : undefined,
      sku: String(item.sku ?? ""),
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
      lineLabel: item.lineLabel ? String(item.lineLabel) : undefined,
    }))
    .filter(
      (item) =>
        item.productId &&
        item.productName &&
        item.sku &&
        item.quantity > 0 &&
        item.unitPrice >= 0
    );

  if (normalizedItems.length === 0) {
    return NextResponse.json({ error: "No valid line items." }, { status: 400 });
  }

  const subtotal = normalizedItems.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );
  const shippingFee = getShippingFee(subtotal);
  const total = subtotal + shippingFee;

  try {
    const order = await createOrder({
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      notes: body.notes?.trim(),
      items: normalizedItems,
      subtotal,
      shippingFee,
      total,
    });

    return NextResponse.json({ order });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Could not place order.",
      },
      { status: 500 }
    );
  }
}

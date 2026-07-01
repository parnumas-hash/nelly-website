import { generateId } from "@/lib/admin/storage";
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";
import {
  CreateOrderInput,
  Order,
  OrderStatus,
} from "@/types/orders";

interface OrderRow {
  id: string;
  order_number: string;
  status: OrderStatus;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  notes: string | null;
  items: Order["items"];
  subtotal: number;
  shipping_fee: number;
  total: number;
  created_at: string;
  updated_at: string;
}

function rowToOrder(row: OrderRow): Order {
  return {
    id: row.id,
    orderNumber: row.order_number,
    status: row.status,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerPhone: row.customer_phone,
    shippingAddress: row.shipping_address,
    notes: row.notes ?? undefined,
    items: Array.isArray(row.items) ? row.items : [],
    subtotal: Number(row.subtotal),
    shippingFee: Number(row.shipping_fee),
    total: Number(row.total),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function buildOrderNumber(): string {
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const suffix = Math.floor(Math.random() * 9000 + 1000);
  return `NEL-${stamp}-${suffix}`;
}

export function ordersEnabled(): boolean {
  return isSupabaseConfigured();
}

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  if (!ordersEnabled()) {
    throw new Error("Orders are not configured.");
  }

  const supabase = createAdminClient();
  const now = new Date().toISOString();
  const row: OrderRow = {
    id: generateId(),
    order_number: buildOrderNumber(),
    status: "pending",
    customer_name: input.customerName.trim(),
    customer_email: input.customerEmail.trim(),
    customer_phone: input.customerPhone.trim(),
    shipping_address: input.shippingAddress.trim(),
    notes: input.notes?.trim() || null,
    items: input.items,
    subtotal: input.subtotal,
    shipping_fee: input.shippingFee,
    total: input.total,
    created_at: now,
    updated_at: now,
  };

  const { data, error } = await supabase
    .from("orders")
    .insert(row)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Could not create order.");
  }

  return rowToOrder(data as OrderRow);
}

export async function listOrders(limit = 100): Promise<Order[]> {
  if (!ordersEnabled()) return [];

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return (data as OrderRow[]).map(rowToOrder);
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus
): Promise<Order> {
  if (!ordersEnabled()) {
    throw new Error("Orders are not configured.");
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Could not update order.");
  }

  return rowToOrder(data as OrderRow);
}

export async function getOrderById(id: string): Promise<Order | null> {
  if (!ordersEnabled()) return null;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? rowToOrder(data as OrderRow) : null;
}

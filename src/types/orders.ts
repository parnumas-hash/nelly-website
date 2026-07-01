export type OrderStatus =
  | "pending"
  | "confirmed"
  | "picking"
  | "shipped"
  | "cancelled";

export interface OrderLineItem {
  productId: string;
  productName: string;
  productSlug: string;
  variantId?: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  lineLabel?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  notes?: string;
  items: OrderLineItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderInput {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  notes?: string;
  items: OrderLineItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
}

export interface CreateOrderRequestBody {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  notes?: string;
  items: Array<{
    productId: string;
    productName: string;
    productSlug: string;
    variantId?: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    lineLabel?: string;
  }>;
}

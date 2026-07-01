"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/utils";
import { Order, OrderStatus } from "@/types/orders";
import { useAdminSession } from "@/context/AdminSessionContext";

const STATUS_OPTIONS: OrderStatus[] = [
  "pending",
  "confirmed",
  "picking",
  "shipped",
  "cancelled",
];

export default function AdminOrdersPage() {
  const { hasPermission } = useAdminSession();
  const canManage = hasPermission("orders:manage");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/admin/orders");
        const payload = (await response.json()) as {
          orders?: Order[];
          error?: string;
        };
        if (!response.ok) {
          throw new Error(payload.error ?? "Could not load orders.");
        }
        setOrders(payload.orders ?? []);
      } catch (loadError) {
        setError(
          loadError instanceof Error ? loadError.message : "Could not load orders."
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const updateStatus = async (id: string, status: OrderStatus) => {
    const response = await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const payload = (await response.json()) as { order?: Order; error?: string };
    if (!response.ok || !payload.order) {
      setError(payload.error ?? "Could not update order.");
      return;
    }
    setOrders((current) =>
      current.map((order) => (order.id === id ? payload.order! : order))
    );
  };

  if (loading) {
    return <div className="py-20 text-center text-neutral-400">Loading...</div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Orders</h1>
        <p className="mt-1 text-neutral-500">
          {orders.length} order(s) · payment confirmation is handled offline for now
        </p>
      </div>

      {error ? (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-200 px-6 py-16 text-center dark:border-neutral-800">
          <p className="text-neutral-500">No orders yet.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-neutral-200 bg-neutral-50 text-xs uppercase tracking-wider text-neutral-500 dark:border-neutral-800 dark:bg-neutral-950">
                <tr>
                  <th className="px-4 py-3 font-medium">Order</th>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Items</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-neutral-100 align-top dark:border-neutral-900"
                  >
                    <td className="px-4 py-3 font-mono text-xs">{order.orderNumber}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{order.customerName}</div>
                      <div className="text-xs text-neutral-500">{order.customerEmail}</div>
                      <div className="text-xs text-neutral-500">{order.customerPhone}</div>
                    </td>
                    <td className="px-4 py-3">
                      <ul className="space-y-1 text-xs text-neutral-600">
                        {order.items.map((item, index) => (
                          <li key={`${item.sku}-${index}`}>
                            {item.productName} · {item.sku} × {item.quantity}
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="px-4 py-3 font-medium">{formatPrice(order.total)}</td>
                    <td className="px-4 py-3">
                      {canManage ? (
                        <select
                          value={order.status}
                          onChange={(event) =>
                            void updateStatus(order.id, event.target.value as OrderStatus)
                          }
                          className="rounded-lg border border-neutral-200 bg-white px-2 py-1 text-xs capitalize dark:border-neutral-700 dark:bg-neutral-950"
                        >
                          {STATUS_OPTIONS.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="capitalize">{order.status}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-neutral-500">
                      {new Date(order.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

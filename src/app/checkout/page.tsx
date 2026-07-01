"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import PageTransition from "@/components/ui/PageTransition";
import Button from "@/components/ui/Button";
import SafeImage from "@/components/ui/SafeImage";
import { useCart } from "@/context/CartContext";
import {
  getCartItemKey,
  getCartItemLineLabel,
  getCartItemPrice,
  getCartItemThumb,
  resolveCartVariant,
} from "@/lib/variants";
import { formatPrice, getShippingFee } from "@/lib/utils";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCart();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    shippingAddress: "",
    notes: "",
  });

  const shippingFee = useMemo(() => getShippingFee(totalPrice), [totalPrice]);
  const orderTotal = totalPrice + shippingFee;

  if (items.length === 0) {
    return (
      <PageTransition>
        <div className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-4 py-16">
          <h1 className="font-display text-2xl font-bold">Nothing to checkout</h1>
          <p className="mt-2 text-neutral-500">Add items to your cart first.</p>
          <Link href="/shop" className="mt-8">
            <Button size="lg">Continue Shopping</Button>
          </Link>
        </div>
      </PageTransition>
    );
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);

    try {
      const payload = {
        ...form,
        items: items.map((item) => {
          const variant = resolveCartVariant(item);
          return {
            productId: item.product.id,
            productName: item.product.name,
            productSlug: item.product.slug,
            variantId: variant.id,
            sku: variant.sku,
            quantity: item.quantity,
            unitPrice: getCartItemPrice(item),
            lineLabel: getCartItemLineLabel(item),
          };
        }),
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as {
        error?: string;
        order?: { orderNumber: string };
      };

      if (!response.ok) {
        throw new Error(data.error ?? "Could not place order.");
      }

      clearCart();
      router.push(
        `/checkout/success?order=${encodeURIComponent(data.order?.orderNumber ?? "")}`
      );
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Could not place order."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <PageTransition>
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
        <div className="mb-10">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.3em] text-primary">
            Checkout
          </p>
          <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
            Complete Your Order
          </h1>
        </div>

        <form
          onSubmit={(event) => void handleSubmit(event)}
          className="grid gap-10 lg:grid-cols-3"
        >
          <div className="space-y-4 lg:col-span-2">
            {(
              [
                ["customerName", "Full name", "text"],
                ["customerEmail", "Email", "email"],
                ["customerPhone", "Phone", "tel"],
              ] as const
            ).map(([key, label, type]) => (
              <label key={key} className="block">
                <span className="mb-2 block text-sm font-medium">{label}</span>
                <input
                  type={type}
                  required
                  value={form[key]}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, [key]: event.target.value }))
                  }
                  className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm focus:border-primary focus:outline-none dark:border-neutral-800 dark:bg-neutral-950"
                />
              </label>
            ))}

            <label className="block">
              <span className="mb-2 block text-sm font-medium">Shipping address</span>
              <textarea
                required
                rows={4}
                value={form.shippingAddress}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    shippingAddress: event.target.value,
                  }))
                }
                className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm focus:border-primary focus:outline-none dark:border-neutral-800 dark:bg-neutral-950"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium">Order notes (optional)</span>
              <textarea
                rows={3}
                value={form.notes}
                onChange={(event) =>
                  setForm((current) => ({ ...current, notes: event.target.value }))
                }
                className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm focus:border-primary focus:outline-none dark:border-neutral-800 dark:bg-neutral-950"
              />
            </label>

            {error ? (
              <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            ) : null}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-28 rounded-2xl border border-neutral-200 p-6 dark:border-neutral-800">
              <h2 className="text-lg font-semibold">Order Summary</h2>
              <ul className="mt-4 space-y-4">
                {items.map((item) => {
                  const lineKey = getCartItemKey(item);
                  const thumb = getCartItemThumb(item);
                  return (
                    <li key={lineKey} className="flex gap-3">
                      <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-xl">
                        <SafeImage src={thumb} alt={item.product.name} fill className="object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{item.product.name}</p>
                        <p className="text-xs text-neutral-500">
                          {getCartItemLineLabel(item)} · Qty {item.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-medium">
                        {formatPrice(getCartItemPrice(item) * item.quantity)}
                      </p>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-6 space-y-3 border-t border-neutral-200 pt-4 dark:border-neutral-800">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Subtotal</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Shipping</span>
                  <span>{shippingFee === 0 ? "Free" : formatPrice(shippingFee)}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(orderTotal)}</span>
                </div>
              </div>

              <Button type="submit" className="mt-6 w-full" size="lg" disabled={busy}>
                {busy ? "Placing order…" : "Place Order"}
              </Button>
              <Link
                href="/cart"
                className="mt-4 block text-center text-sm text-neutral-500 hover:text-primary"
              >
                Back to cart
              </Link>
            </div>
          </div>
        </form>
      </div>
    </PageTransition>
  );
}

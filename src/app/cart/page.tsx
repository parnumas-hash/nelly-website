"use client";

import Link from "next/link";
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag } from "lucide-react";
import PageTransition from "@/components/ui/PageTransition";
import Button from "@/components/ui/Button";
import SafeImage from "@/components/ui/SafeImage";
import {
  getCartItemKey,
  getCartItemLineLabel,
  getCartItemPrice,
  getCartItemThumb,
  resolveCartVariant,
} from "@/lib/variants";
import { useCart } from "@/context/CartContext";
import { formatPrice, getShippingFee } from "@/lib/utils";

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice, clearCart } =
    useCart();

  if (items.length === 0) {
    return (
      <PageTransition>
        <div className="mx-auto flex min-h-[60vh] max-w-7xl flex-col items-center justify-center px-4 py-16 md:px-6">
          <ShoppingBag className="mb-6 h-16 w-16 text-neutral-300" />
          <h1 className="font-display text-2xl font-bold">Your cart is empty</h1>
          <p className="mt-2 text-neutral-500">
            Discover our curated collection of luxury pieces.
          </p>
          <Link href="/shop" className="mt-8">
            <Button size="lg" className="gap-2">
              Continue Shopping
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.3em] text-primary">
              Shopping
            </p>
            <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
              Your Cart
            </h1>
          </div>
          <button
            onClick={clearCart}
            className="text-sm text-neutral-500 hover:text-primary"
          >
            Clear all
          </button>
        </div>

        <div className="grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {items.map((item) => {
                const lineKey = getCartItemKey(item);
                const variant = resolveCartVariant(item);
                const unitPrice = getCartItemPrice(item);
                const thumb = getCartItemThumb(item);

                return (
                <li
                  key={lineKey}
                  className="flex gap-6 py-6 first:pt-0"
                >
                  <Link
                    href={`/product/${item.product.slug}`}
                    className="relative h-32 w-28 shrink-0 overflow-hidden rounded-2xl"
                  >
                    <SafeImage
                      src={thumb}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </Link>
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between">
                      <div>
                        <Link
                          href={`/product/${item.product.slug}`}
                          className="font-medium hover:text-primary"
                        >
                          {item.product.name}
                        </Link>
                        <p className="mt-1 text-sm text-neutral-500">
                          {getCartItemLineLabel(item)}
                        </p>
                        {variant.sku && (
                          <p className="text-xs text-neutral-400">
                            SKU: {variant.sku}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() =>
                          removeItem(item.product.id, lineKey)
                        }
                        className="text-neutral-400 hover:text-primary"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center rounded-full border border-neutral-200 dark:border-neutral-800">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.product.id,
                              lineKey,
                              item.quantity - 1
                            )
                          }
                          className="flex h-9 w-9 items-center justify-center hover:text-primary"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center text-sm">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.product.id,
                              lineKey,
                              item.quantity + 1
                            )
                          }
                          className="flex h-9 w-9 items-center justify-center hover:text-primary"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <span className="font-semibold">
                        {formatPrice(unitPrice * item.quantity)}
                      </span>
                    </div>
                  </div>
                </li>
                );
              })}
            </ul>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-28 rounded-2xl border border-neutral-200 p-6 dark:border-neutral-800">
              <h2 className="text-lg font-semibold">Order Summary</h2>
              <div className="mt-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Subtotal</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Shipping</span>
                  <span>
                    {getShippingFee(totalPrice) === 0
                      ? "Free"
                      : formatPrice(getShippingFee(totalPrice))}
                  </span>
                </div>
                <div className="border-t border-neutral-200 pt-3 dark:border-neutral-800">
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>
                      {formatPrice(totalPrice + getShippingFee(totalPrice))}
                    </span>
                  </div>
                </div>
              </div>
              <Button className="mt-6 w-full" size="lg">
                Proceed to Checkout
              </Button>
              <Link
                href="/shop"
                className="mt-4 block text-center text-sm text-neutral-500 hover:text-primary"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

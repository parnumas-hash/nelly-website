"use client";

import Link from "next/link";
import SafeImage from "@/components/ui/SafeImage";
import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getCartItemKey,
  getCartItemLineLabel,
  getCartItemPrice,
  getCartItemThumb,
  resolveCartVariant,
} from "@/lib/variants";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import Button from "@/components/ui/Button";

export default function CartDrawer() {
  const {
    items,
    isOpen,
    setIsOpen,
    removeItem,
    updateQuantity,
    totalPrice,
    totalItems,
  } = useCart();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white dark:bg-neutral-950"
          >
            <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-5 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                <h2 className="text-lg font-semibold">Cart ({totalItems})</h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-2 hover:bg-neutral-100 dark:hover:bg-neutral-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6">
                <ShoppingBag className="h-12 w-12 text-neutral-300" />
                <p className="text-neutral-500">Your cart is empty</p>
                <Link href="/shop" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Continue Shopping
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-6 py-4">
                  <ul className="space-y-6">
                    {items.map((item) => {
                      const lineKey = getCartItemKey(item);
                      const variant = resolveCartVariant(item);
                      const unitPrice = getCartItemPrice(item);
                      const thumb = getCartItemThumb(item);

                      return (
                        <li key={lineKey} className="flex gap-4">
                          <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl">
                            <SafeImage
                              src={thumb}
                              alt={item.product.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex flex-1 flex-col">
                            <div className="flex items-start justify-between">
                              <div>
                                <Link
                                  href={`/product/${item.product.slug}`}
                                  onClick={() => setIsOpen(false)}
                                  className="text-sm font-medium hover:text-primary"
                                >
                                  {item.product.name}
                                </Link>
                                <p className="mt-0.5 text-xs text-neutral-500">
                                  {getCartItemLineLabel(item)}
                                </p>
                                {variant.sku && (
                                  <p className="text-[10px] text-neutral-400">
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
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                            <div className="mt-auto flex items-center justify-between">
                              <div className="flex items-center gap-2 rounded-full border border-neutral-200 dark:border-neutral-800">
                                <button
                                  onClick={() =>
                                    updateQuantity(
                                      item.product.id,
                                      lineKey,
                                      item.quantity - 1
                                    )
                                  }
                                  className="flex h-8 w-8 items-center justify-center hover:text-primary"
                                >
                                  <Minus className="h-3 w-3" />
                                </button>
                                <span className="w-6 text-center text-sm">
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
                                  className="flex h-8 w-8 items-center justify-center hover:text-primary"
                                >
                                  <Plus className="h-3 w-3" />
                                </button>
                              </div>
                              <span className="text-sm font-semibold">
                                {formatPrice(unitPrice * item.quantity)}
                              </span>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <div className="border-t border-neutral-200 px-6 py-5 dark:border-neutral-800">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-neutral-500">Subtotal</span>
                    <span className="text-lg font-semibold">
                      {formatPrice(totalPrice)}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Link
                      href="/cart"
                      onClick={() => setIsOpen(false)}
                      className="block"
                    >
                      <Button className="w-full" variant="primary">
                        View Cart
                      </Button>
                    </Link>
                    <Button className="w-full" variant="secondary">
                      Checkout
                    </Button>
                  </div>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

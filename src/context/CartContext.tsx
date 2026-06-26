"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { CartItem, Product, ProductVariant } from "@/types";
import { repairStorefrontProduct } from "@/lib/image-utils";
import {
  getCartItemKey,
  getCartItemPrice,
  getMaxAddQuantity,
  getVariantStockLimit,
  normalizeVariant,
  resolveCartVariant,
  resolveProductVariantForAdd,
} from "@/lib/variants";

interface CartContextType {
  items: CartItem[];
  addItem: (
    product: Product,
    variant?: ProductVariant | null,
    quantity?: number
  ) => void;
  removeItem: (productId: string, lineKey: string) => void;
  updateQuantity: (
    productId: string,
    lineKey: string,
    quantity: number
  ) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  getLineStockLimit: (productId: string, lineKey: string) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = "nelly-cart";

function normalizeStoredCartItem(raw: Record<string, unknown>): CartItem {
  const product = raw.product as Product;
  const quantity =
    typeof raw.quantity === "number" && raw.quantity > 0 ? raw.quantity : 1;

  const item: CartItem = {
    product: repairStorefrontProduct({
      ...product,
      variants: Array.isArray(product?.variants) ? product.variants : [],
      images: product?.images ?? [],
      colors: product?.colors ?? [],
      sizes: product?.sizes ?? [],
      price: product?.price ?? 0,
      inStock: product?.inStock ?? false,
    } as Product),
    quantity,
    selectedColor:
      typeof raw.selectedColor === "string" ? raw.selectedColor : undefined,
    selectedSize:
      typeof raw.selectedSize === "string" ? raw.selectedSize : undefined,
    selectedScent:
      typeof raw.selectedScent === "string" ? raw.selectedScent : undefined,
  };

  if (raw.variant && typeof raw.variant === "object") {
    item.variant = normalizeVariant(raw.variant as ProductVariant);
  }

  return item;
}

function matchesLine(item: CartItem, productId: string, lineKey: string): boolean {
  return item.product.id === productId && getCartItemKey(item) === lineKey;
}

function clampItemQuantity(item: CartItem, quantity: number): number {
  const variant = resolveCartVariant(item);
  const limit = getVariantStockLimit(variant);
  if (limit <= 0) return 0;
  return Math.min(Math.max(1, quantity), limit);
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Record<string, unknown>[];
        const normalized = parsed.map(normalizeStoredCartItem);
        setItems(
          normalized
            .map((item) => ({
              ...item,
              quantity: clampItemQuantity(item, item.quantity),
            }))
            .filter((item) => item.quantity > 0)
        );
      }
    } catch {
      /* ignore corrupt cart data */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, hydrated]);

  const getLineStockLimit = useCallback(
    (productId: string, lineKey: string) => {
      const item = items.find((i) => matchesLine(i, productId, lineKey));
      if (!item) return 0;
      return getVariantStockLimit(resolveCartVariant(item));
    },
    [items]
  );

  const addItem = useCallback(
    (product: Product, variant?: ProductVariant | null, quantity = 1) => {
      const resolved = resolveProductVariantForAdd(product, variant);
      const lineKey = `${product.id}-${resolved.id}`;
      const stockLimit = getVariantStockLimit(resolved);
      if (stockLimit <= 0) return;

      setItems((prev) => {
        const existing = prev.find((i) => getCartItemKey(i) === lineKey);
        const currentQty = existing?.quantity ?? 0;
        const maxAdd = getMaxAddQuantity(resolved, currentQty);
        if (maxAdd <= 0) return prev;

        const addQty = Math.min(quantity, maxAdd);

        if (existing) {
          return prev.map((i) =>
            getCartItemKey(i) === lineKey
              ? {
                  ...i,
                  quantity: currentQty + addQty,
                  variant: resolved,
                }
              : i
          );
        }
        return [
          ...prev,
          {
            product,
            variant: resolved,
            quantity: addQty,
            selectedColor: resolved.color,
            selectedSize: resolved.size,
            selectedScent: resolved.scent,
          },
        ];
      });
      setIsOpen(true);
    },
    []
  );

  const removeItem = useCallback((productId: string, lineKey: string) => {
    setItems((prev) =>
      prev.filter((i) => !matchesLine(i, productId, lineKey))
    );
  }, []);

  const updateQuantity = useCallback(
    (productId: string, lineKey: string, quantity: number) => {
      if (quantity <= 0) {
        removeItem(productId, lineKey);
        return;
      }
      setItems((prev) =>
        prev.map((i) => {
          if (!matchesLine(i, productId, lineKey)) return i;
          return { ...i, quantity: clampItemQuantity(i, quantity) };
        })
      );
    },
    [removeItem]
  );

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce(
    (sum, i) => sum + getCartItemPrice(i) * i.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        isOpen,
        setIsOpen,
        getLineStockLimit,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}

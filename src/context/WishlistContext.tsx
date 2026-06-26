"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { Product } from "@/types";
import { useCatalog } from "@/context/CatalogContext";

interface WishlistContextType {
  items: Product[];
  itemIds: string[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  toggleItem: (product: Product) => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined
);

const STORAGE_KEY = "nelly-wishlist";

function migrateWishlistIds(stored: unknown): string[] {
  if (!Array.isArray(stored)) return [];
  if (stored.length === 0) return [];
  if (typeof stored[0] === "string") {
    return stored.filter((id): id is string => typeof id === "string");
  }
  return (stored as Product[])
    .map((product) => product?.id)
    .filter((id): id is string => typeof id === "string");
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { publishedProducts, ready } = useCatalog();
  const [itemIds, setItemIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setItemIds(migrateWishlistIds(JSON.parse(stored)));
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(itemIds));
    }
  }, [itemIds, hydrated]);

  const items = useMemo(() => {
    if (!ready) return [];
    return itemIds
      .map((id) => publishedProducts.find((product) => product.id === id))
      .filter((product): product is Product => product !== undefined);
  }, [itemIds, publishedProducts, ready]);

  const addItem = useCallback((product: Product) => {
    setItemIds((prev) => {
      if (prev.includes(product.id)) return prev;
      return [...prev, product.id];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItemIds((prev) => prev.filter((id) => id !== productId));
  }, []);

  const isInWishlist = useCallback(
    (productId: string) => itemIds.includes(productId),
    [itemIds]
  );

  const toggleItem = useCallback(
    (product: Product) => {
      if (isInWishlist(product.id)) {
        removeItem(product.id);
      } else {
        addItem(product);
      }
    },
    [isInWishlist, addItem, removeItem]
  );

  return (
    <WishlistContext.Provider
      value={{ items, itemIds, addItem, removeItem, isInWishlist, toggleItem }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context)
    throw new Error("useWishlist must be used within WishlistProvider");
  return context;
}

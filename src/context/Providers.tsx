"use client";

import { CartProvider } from "./CartContext";
import { WishlistProvider } from "./WishlistContext";
import { AuthProvider } from "./AuthContext";
import { ThemeProvider } from "./ThemeProvider";
import { CatalogProvider } from "./CatalogContext";
import LayoutShell from "@/components/layout/LayoutShell";
import { type ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <CatalogProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <LayoutShell>{children}</LayoutShell>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </CatalogProvider>
    </ThemeProvider>
  );
}

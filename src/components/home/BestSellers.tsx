"use client";

import ProductSection from "@/components/product/ProductSection";
import { useCatalog } from "@/context/CatalogContext";

export default function BestSellers() {
  const { getBestSellers, ready } = useCatalog();
  const products = ready ? getBestSellers() : [];

  return (
    <ProductSection
      eyebrow="Customer Favorites"
      title="Best Sellers"
      description="The most loved products by our community of discerning pet parents."
      products={products}
      href="/shop"
      linkLabel="Shop Best Sellers"
      background="gray"
      limit={4}
      columns={4}
    />
  );
}

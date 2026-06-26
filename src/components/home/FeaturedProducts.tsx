"use client";

import ProductSection from "@/components/product/ProductSection";
import { useCatalog } from "@/context/CatalogContext";

export default function FeaturedProducts() {
  const { getFeaturedProducts, ready } = useCatalog();
  const products = ready ? getFeaturedProducts() : [];

  if (!ready) return null;

  return (
    <ProductSection
      title="Featured Collection"
      products={products}
      href="/shop"
      linkLabel="View All"
      background="white"
      limit={4}
      columns={4}
    />
  );
}

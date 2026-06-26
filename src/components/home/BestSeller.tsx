"use client";

import ProductSection from "@/components/product/ProductSection";
import { useCatalog } from "@/context/CatalogContext";

export default function BestSeller() {
  const { getBestSellers, ready } = useCatalog();
  const products = ready ? getBestSellers() : [];

  return (
    <ProductSection
      title="Best Seller"
      products={products}
      href="/shop"
      linkLabel="View All"
      background="white"
      limit={4}
      columns={4}
    />
  );
}

"use client";

import ProductSection from "@/components/product/ProductSection";
import { useCatalog } from "@/context/CatalogContext";

export default function NewCollection() {
  const { getNewArrivals, ready } = useCatalog();
  const products = ready ? getNewArrivals() : [];

  return (
    <ProductSection
      title="New Collection"
      products={products}
      href="/shop?sort=newest"
      linkLabel="View All"
      background="gray"
      limit={4}
      columns={4}
    />
  );
}

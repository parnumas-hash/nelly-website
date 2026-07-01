"use client";

import { useMemo } from "react";
import ProductSection from "@/components/product/ProductSection";
import { useCatalog } from "@/context/CatalogContext";
import { getDefaultHomepageContent } from "@/lib/admin/homepage-content";
import {
  HOMEPAGE_PRODUCT_GRID_LIMIT,
  resolveNewCollectionProducts,
} from "@/lib/homepage-product-selection";

export default function NewCollection() {
  const { publishedProducts, homepageContent, ready } = useCatalog();
  const content = homepageContent.newCollection;
  const fallback = getDefaultHomepageContent().newCollection;

  const products = useMemo(() => {
    if (!ready) return [];
    return resolveNewCollectionProducts(publishedProducts, content.productIds);
  }, [ready, publishedProducts, content.productIds]);

  return (
    <ProductSection
      title={content.title || fallback.title}
      products={products}
      href={content.href || fallback.href}
      linkLabel={content.linkLabel || fallback.linkLabel}
      background="gray"
      limit={HOMEPAGE_PRODUCT_GRID_LIMIT}
      columns={4}
    />
  );
}

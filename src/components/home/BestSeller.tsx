"use client";

import { useMemo } from "react";
import ProductSection from "@/components/product/ProductSection";
import { useCatalog } from "@/context/CatalogContext";
import { getDefaultHomepageContent } from "@/lib/admin/homepage-content";
import {
  HOMEPAGE_PRODUCT_GRID_LIMIT,
  resolveBestSellerProducts,
} from "@/lib/homepage-product-selection";

export default function BestSeller() {
  const { publishedProducts, homepageContent, ready } = useCatalog();
  const content = homepageContent.bestSeller;
  const fallback = getDefaultHomepageContent().bestSeller;

  const products = useMemo(() => {
    if (!ready) return [];
    return resolveBestSellerProducts(publishedProducts, content.productIds);
  }, [ready, publishedProducts, content.productIds]);

  return (
    <ProductSection
      title={content.title || fallback.title}
      products={products}
      href={content.href || fallback.href}
      linkLabel={content.linkLabel || fallback.linkLabel}
      background="white"
      limit={HOMEPAGE_PRODUCT_GRID_LIMIT}
      columns={4}
    />
  );
}

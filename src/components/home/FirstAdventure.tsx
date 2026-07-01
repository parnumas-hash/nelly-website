"use client";

import { useMemo } from "react";
import { useCatalog } from "@/context/CatalogContext";
import CollectionSection from "@/components/home/CollectionSection";
import { getDefaultHomepageContent } from "@/lib/admin/homepage-content";
import { resolveFirstAdventureProducts } from "@/lib/first-adventure-products";

export default function FirstAdventure() {
  const { publishedProducts, homepageContent, ready } = useCatalog();
  const content = homepageContent.firstAdventure;
  const fallback = getDefaultHomepageContent().firstAdventure;

  const products = useMemo(() => {
    if (!ready) return [];
    return resolveFirstAdventureProducts(
      publishedProducts,
      content.productIds
    );
  }, [ready, publishedProducts, content.productIds]);

  return (
    <CollectionSection
      id="first-adventure"
      title={content.title || fallback.title}
      description={content.description || fallback.description}
      image={content.imageUrl || fallback.imageUrl}
      imageAlt={content.imageAlt || fallback.imageAlt}
      products={products}
      href={content.href || fallback.href}
      ctaLabel={content.ctaLabel || fallback.ctaLabel}
      background="gray"
      reversed
    />
  );
}

"use client";

import { useMemo } from "react";
import { useCatalog } from "@/context/CatalogContext";
import CollectionSection from "@/components/home/CollectionSection";
import { getDefaultHomepageContent } from "@/lib/admin/homepage-content";

const STARTER_TAGS = new Set([
  "starter",
  "first-adventure",
  "essentials",
  "new-pawrent",
  "new",
]);

export default function FirstAdventure() {
  const { publishedProducts, homepageContent, ready } = useCatalog();
  const content = homepageContent.firstAdventure;
  const fallback = getDefaultHomepageContent().firstAdventure;

  const products = useMemo(() => {
    if (!ready) return [];

    const tagged = publishedProducts.filter(
      (product) =>
        product.isNew ||
        product.tags?.some((tag) => STARTER_TAGS.has(tag.toLowerCase()))
    );

    if (tagged.length > 0) return tagged;

    return publishedProducts.filter((product) => product.featured);
  }, [ready, publishedProducts]);

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

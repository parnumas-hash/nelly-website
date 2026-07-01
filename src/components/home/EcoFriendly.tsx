"use client";

import { useMemo } from "react";
import CollectionSection from "@/components/home/CollectionSection";
import { useCatalog } from "@/context/CatalogContext";
import { getDefaultHomeCollections } from "@/lib/admin/storage";
import { resolveEcoCollectionProducts } from "@/lib/homepage-product-selection";

export default function EcoFriendly() {
  const { publishedProducts, ready, homeCollections } = useCatalog();
  const content = homeCollections ?? getDefaultHomeCollections();
  const { title, description, imageUrl, href, imageAlt, productIds } =
    content.eco;

  const products = useMemo(() => {
    if (!ready) return [];
    return resolveEcoCollectionProducts(publishedProducts, productIds);
  }, [ready, publishedProducts, productIds]);

  return (
    <CollectionSection
      id="eco"
      title={title}
      description={description}
      image={imageUrl}
      imageAlt={imageAlt}
      products={products}
      href={href}
      background="white"
    />
  );
}

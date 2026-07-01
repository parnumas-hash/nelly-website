"use client";

import { useMemo } from "react";
import CollectionSection from "@/components/home/CollectionSection";
import { useCatalog } from "@/context/CatalogContext";
import { getDefaultHomeCollections } from "@/lib/admin/storage";
import { resolveTravelCollectionProducts } from "@/lib/homepage-product-selection";

export default function TravelWithPets() {
  const { publishedProducts, ready, homeCollections } = useCatalog();
  const content = homeCollections ?? getDefaultHomeCollections();
  const { title, description, imageUrl, href, imageAlt, productIds } =
    content.travel;

  const products = useMemo(() => {
    if (!ready) return [];
    return resolveTravelCollectionProducts(publishedProducts, productIds);
  }, [ready, publishedProducts, productIds]);

  return (
    <CollectionSection
      id="travel"
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

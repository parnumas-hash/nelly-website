"use client";

import CollectionSection from "@/components/home/CollectionSection";
import { useCatalog } from "@/context/CatalogContext";
import { getDefaultHomeCollections } from "@/lib/admin/storage";

export default function HomeLiving() {
  const { publishedProducts, ready, homeCollections } = useCatalog();
  const products = ready
    ? publishedProducts.filter((p) => p.category === "beds").slice(0, 4)
    : [];
  const content = homeCollections ?? getDefaultHomeCollections();
  const { title, description, imageUrl, href, imageAlt } = content.home;

  return (
    <CollectionSection
      id="home-living"
      title={title}
      description={description}
      image={imageUrl}
      imageAlt={imageAlt}
      products={products}
      href={href}
      background="gray"
      reversed
    />
  );
}

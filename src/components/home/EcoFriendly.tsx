"use client";

import CollectionSection from "@/components/home/CollectionSection";
import { useCatalog } from "@/context/CatalogContext";
import { getDefaultHomeCollections } from "@/lib/admin/storage";

export default function EcoFriendly() {
  const { publishedProducts, ready, homeCollections } = useCatalog();
  const products = ready
    ? publishedProducts
        .filter(
          (p) =>
            p.category === "eco" ||
            p.brand === "Earth Rated" ||
            p.tags.includes("eco")
        )
        .slice(0, 4)
    : [];
  const content = homeCollections ?? getDefaultHomeCollections();
  const { title, description, imageUrl, href, imageAlt } = content.eco;

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

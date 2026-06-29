"use client";

import CollectionSection from "@/components/home/CollectionSection";
import { useCatalog } from "@/context/CatalogContext";
import { getDefaultHomeCollections } from "@/lib/admin/storage";

function useTravelProducts() {
  const { publishedProducts, ready } = useCatalog();
  if (!ready) return [];
  return publishedProducts
    .filter((p) => ["strollers", "accessories"].includes(p.category))
    .slice(0, 4);
}

export default function TravelWithPets() {
  const products = useTravelProducts();
  const { homeCollections } = useCatalog();
  const content = homeCollections ?? getDefaultHomeCollections();
  const { title, description, imageUrl, href, imageAlt } = content.travel;

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

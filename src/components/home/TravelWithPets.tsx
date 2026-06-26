"use client";

import CollectionSection from "@/components/home/CollectionSection";
import { collections } from "@/lib/collections";
import { useCatalog } from "@/context/CatalogContext";

function useTravelProducts() {
  const { publishedProducts, ready } = useCatalog();
  if (!ready) return [];
  return publishedProducts
    .filter((p) => ["strollers", "accessories"].includes(p.category))
    .slice(0, 4);
}

export default function TravelWithPets() {
  const products = useTravelProducts();
  const { title, description, image, href } = collections.travel;

  return (
    <CollectionSection
      id="travel"
      title={title}
      description={description}
      image={image}
      imageAlt="Premium pet travel and strollers"
      products={products}
      href={href}
      background="white"
    />
  );
}

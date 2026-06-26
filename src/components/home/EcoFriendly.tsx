"use client";

import CollectionSection from "@/components/home/CollectionSection";
import { collections } from "@/lib/collections";
import { useCatalog } from "@/context/CatalogContext";

export default function EcoFriendly() {
  const { publishedProducts, ready } = useCatalog();
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
  const { title, description, image, href } = collections.eco;

  return (
    <CollectionSection
      id="eco"
      title={title}
      description={description}
      image={image}
      imageAlt="Eco-friendly pet products"
      products={products}
      href={href}
      background="white"
    />
  );
}

"use client";

import { useMemo } from "react";
import { useCatalog } from "@/context/CatalogContext";
import CollectionSection from "@/components/home/CollectionSection";
import { images } from "@/lib/images";

const STARTER_TAGS = new Set([
  "starter",
  "first-adventure",
  "essentials",
  "new-pawrent",
  "new",
]);

export default function FirstAdventure() {
  const { publishedProducts, ready } = useCatalog();

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
      title="First Adventure"
      description="Everything a new pet parent needs — hand-picked essentials from our curated brands to start your journey with confidence."
      image={images.pets.puppy}
      imageAlt="New pet parent essentials curated by NELLY GROUP"
      products={products}
      href="/shop?sort=newest"
      background="gray"
      reversed
    />
  );
}

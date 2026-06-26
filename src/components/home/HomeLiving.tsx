"use client";

import CollectionSection from "@/components/home/CollectionSection";
import { collections } from "@/lib/collections";
import { useCatalog } from "@/context/CatalogContext";

export default function HomeLiving() {
  const { publishedProducts, ready } = useCatalog();
  const products = ready
    ? publishedProducts.filter((p) => p.category === "beds").slice(0, 4)
    : [];
  const { title, description, image, href } = collections.home;

  return (
    <CollectionSection
      id="home-living"
      title={title}
      description={description}
      image={image}
      imageAlt="Premium pet beds and home furniture"
      products={products}
      href={href}
      background="gray"
      reversed
    />
  );
}

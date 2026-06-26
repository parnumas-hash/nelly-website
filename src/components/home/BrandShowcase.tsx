"use client";

import { brands as staticBrands } from "@/lib/brands";
import Section from "@/components/ui/Section";
import SectionHeader from "@/components/ui/SectionHeader";
import BrandCard from "@/components/brand/BrandCard";
import { useCatalog } from "@/context/CatalogContext";
import { Brand } from "@/types";

export default function BrandShowcase() {
  const { brands: adminBrands, ready } = useCatalog();

  const displayBrands: Brand[] = ready
    ? adminBrands.filter((b) => b.active)
    : staticBrands;

  return (
    <Section id="brands" background="white" ariaLabel="Featured brands">
      <SectionHeader
        eyebrow="Our Brands"
        title="Curated for Excellence"
        description="We partner with the world's most distinguished pet lifestyle brands — each selected for quality, design, and the joy they bring to your companion."
        href="/shop"
        linkLabel="Explore All Brands"
        align="center"
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
        {displayBrands.map((brand, i) => (
          <BrandCard key={brand.id} brand={brand} index={i} />
        ))}
      </div>
    </Section>
  );
}

"use client";

import { brands as staticBrands } from "@/lib/brands";
import Section from "@/components/ui/Section";
import SectionHeader from "@/components/ui/SectionHeader";
import BrandCard from "@/components/brand/BrandCard";
import { useCatalog } from "@/context/CatalogContext";
import { Brand } from "@/types";

export default function ShopByBrand() {
  const { brands: adminBrands, ready } = useCatalog();

  const displayBrands: Brand[] = ready
    ? adminBrands.filter((b) => b.active)
    : staticBrands;

  return (
    <Section id="brands" background="white" ariaLabel="Shop by brand">
      <SectionHeader
        title="Shop by Brand"
        description="Eight world-class partners. One destination for premium pet living."
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

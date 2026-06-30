"use client";

import Section from "@/components/ui/Section";
import SectionHeader from "@/components/ui/SectionHeader";
import BenefitCard from "@/components/ui/BenefitCard";
import { useCatalog } from "@/context/CatalogContext";
import { getBenefitIcon } from "@/lib/benefit-icons";

export default function Benefits() {
  const { homepageContent } = useCatalog();
  const content = homepageContent.benefits;

  return (
    <Section id="benefits" background="white" ariaLabel="Why choose NELLY GROUP">
      <SectionHeader
        eyebrow={content.eyebrow}
        title={content.title}
        description={content.description}
        align="center"
      />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {content.items.map((benefit, i) => (
          <BenefitCard
            key={benefit.title}
            icon={getBenefitIcon(benefit.icon)}
            title={benefit.title}
            description={benefit.description}
            index={i}
          />
        ))}
      </div>
    </Section>
  );
}

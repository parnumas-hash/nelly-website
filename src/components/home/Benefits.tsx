"use client";

import { benefits } from "@/lib/benefits";
import Section from "@/components/ui/Section";
import SectionHeader from "@/components/ui/SectionHeader";
import BenefitCard from "@/components/ui/BenefitCard";

export default function Benefits() {
  return (
    <Section id="benefits" background="white" ariaLabel="Why choose NELLY GROUP">
      <SectionHeader
        eyebrow="The NELLY Difference"
        title="Why Choose NELLY GROUP"
        description="We elevate pet retail to an art form — combining world-class brands with an uncompromising commitment to quality and service."
        align="center"
      />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {benefits.map((benefit, i) => (
          <BenefitCard
            key={benefit.title}
            icon={benefit.icon}
            title={benefit.title}
            description={benefit.description}
            index={i}
          />
        ))}
      </div>
    </Section>
  );
}

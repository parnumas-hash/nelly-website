"use client";

import Section from "@/components/ui/Section";
import SectionHeader from "@/components/ui/SectionHeader";
import ReviewCard from "@/components/ui/ReviewCard";
import { useCatalog } from "@/context/CatalogContext";

export default function Testimonials() {
  const { homepageContent } = useCatalog();
  const content = homepageContent.testimonials;

  return (
    <Section
      id="reviews"
      background="gray"
      ariaLabel="Customer reviews"
    >
      <SectionHeader
        eyebrow={content.eyebrow}
        title={content.title}
        description={content.description}
        align="center"
      />

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {content.items.map((testimonial, i) => (
          <ReviewCard key={testimonial.id} testimonial={testimonial} index={i} />
        ))}
      </div>
    </Section>
  );
}

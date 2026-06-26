import { testimonials } from "@/lib/testimonials";
import Section from "@/components/ui/Section";
import SectionHeader from "@/components/ui/SectionHeader";
import ReviewCard from "@/components/ui/ReviewCard";

export default function Testimonials() {
  return (
    <Section
      id="reviews"
      background="gray"
      ariaLabel="Customer reviews"
    >
      <SectionHeader
        eyebrow="Testimonials"
        title="Loved by Pet Parents"
        description="Join thousands of discerning pet owners who trust NELLY GROUP for their companion's lifestyle."
        align="center"
      />

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {testimonials.map((testimonial, i) => (
          <ReviewCard key={testimonial.id} testimonial={testimonial} index={i} />
        ))}
      </div>
    </Section>
  );
}

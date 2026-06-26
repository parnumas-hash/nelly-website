import Image from "next/image";
import Section from "@/components/ui/Section";
import SectionHeader from "@/components/ui/SectionHeader";
import TextLink from "@/components/ui/TextLink";
import FadeIn from "@/components/ui/FadeIn";

export default function BrandStory() {
  return (
    <Section id="story" background="white" ariaLabel="Brand story">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <FadeIn direction="left">
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-neutral-100 dark:bg-neutral-900">
            <Image
              src="https://images.unsplash.com/photo-1548191265-cc70d3d45c01?w=900&q=80"
              alt="Pet parent sharing a quiet moment with their companion at home"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </FadeIn>

        <FadeIn direction="right" delay={0.15}>
          <SectionHeader
            eyebrow="Our Story"
            title="Crafted for Companions Who Deserve Extraordinary"
            description="NELLY GROUP exists at the intersection of design, quality, and love. We curate the world's most distinguished pet lifestyle brands — not for mass market, but for those who see their companion as family."
          />
          <p className="-mt-6 text-[17px] leading-relaxed text-neutral-500">
            Every product in our collection is chosen with intention. Authentic,
            design-forward, and built to last. We believe luxury is not about
            excess — it is about choosing what truly matters.
          </p>
          <div className="mt-8">
            <TextLink href="#brands">Discover Our Brands</TextLink>
          </div>
        </FadeIn>
      </div>
    </Section>
  );
}

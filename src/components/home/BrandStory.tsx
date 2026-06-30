"use client";

import Image from "next/image";
import Section from "@/components/ui/Section";
import SectionHeader from "@/components/ui/SectionHeader";
import TextLink from "@/components/ui/TextLink";
import FadeIn from "@/components/ui/FadeIn";
import { useCatalog } from "@/context/CatalogContext";
import { getDefaultHomepageContent } from "@/lib/admin/homepage-content";
import { shouldUnoptimize } from "@/lib/image-utils";

export default function BrandStory() {
  const { homepageContent } = useCatalog();
  const content = homepageContent.brandStory;
  const fallback = getDefaultHomepageContent().brandStory;
  const imageSrc = content.imageUrl || fallback.imageUrl;

  return (
    <Section id="story" background="white" ariaLabel="Brand story">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <FadeIn direction="left">
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-neutral-100 dark:bg-neutral-900">
            <Image
              src={imageSrc}
              alt={content.imageAlt || fallback.imageAlt}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              unoptimized={shouldUnoptimize(imageSrc)}
            />
          </div>
        </FadeIn>

        <FadeIn direction="right" delay={0.15}>
          <SectionHeader
            eyebrow={content.eyebrow}
            title={content.title}
            description={content.description}
          />
          <p className="-mt-6 text-[17px] leading-relaxed text-neutral-500">
            {content.body}
          </p>
          <div className="mt-8">
            <TextLink href={content.ctaHref}>{content.ctaLabel}</TextLink>
          </div>
        </FadeIn>
      </div>
    </Section>
  );
}

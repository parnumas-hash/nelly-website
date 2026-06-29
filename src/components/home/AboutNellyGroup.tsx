"use client";

import Image from "next/image";
import Section from "@/components/ui/Section";
import TextLink from "@/components/ui/TextLink";
import { useCatalog } from "@/context/CatalogContext";
import { getDefaultAbout } from "@/lib/admin/storage";
import { BRAND_LOGO_HEIGHT, BRAND_LOGO_WIDTH } from "@/lib/brand-assets";
import { shouldUnoptimize } from "@/lib/image-utils";

export default function AboutNellyGroup() {
  const { about } = useCatalog();
  const content = about ?? getDefaultAbout();
  const paragraphs = content.body.split(/\n\n+/).filter(Boolean);
  const imageSrc = content.imageUrl || getDefaultAbout().imageUrl;

  return (
    <Section id="about" background="gray" ariaLabel="About NELLY GROUP">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <div className="flex aspect-[4/5] items-center justify-center rounded-2xl bg-white p-8 shadow-sm ring-1 ring-neutral-100 dark:bg-neutral-900 dark:ring-neutral-800 md:p-12">
          <Image
            src={imageSrc}
            alt={content.title}
            width={BRAND_LOGO_WIDTH}
            height={BRAND_LOGO_HEIGHT}
            className="max-h-full max-w-[85%] object-contain md:max-w-[75%]"
            unoptimized={shouldUnoptimize(imageSrc)}
          />
        </div>

        <div>
          <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.3em] text-primary">
            {content.eyebrow}
          </p>
          <h2 className="font-display text-[32px] font-bold tracking-tight text-neutral-900 dark:text-white md:text-[44px]">
            {content.title}
          </h2>
          <div className="mt-6 space-y-4 text-[17px] leading-relaxed text-neutral-500">
            {paragraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
          <TextLink href={content.ctaHref} className="mt-8">
            {content.ctaLabel}
          </TextLink>
        </div>
      </div>
    </Section>
  );
}

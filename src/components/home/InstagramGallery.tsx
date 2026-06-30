"use client";

import Section from "@/components/ui/Section";
import SectionHeader from "@/components/ui/SectionHeader";
import InstagramTile from "@/components/ui/InstagramTile";
import TextLink from "@/components/ui/TextLink";
import { useCatalog } from "@/context/CatalogContext";

export default function InstagramGallery() {
  const { homepageContent } = useCatalog();
  const content = homepageContent.instagram;

  return (
    <Section id="instagram" background="gray" ariaLabel="Instagram gallery">
      <SectionHeader
        title={content.title}
        description={content.description}
        align="center"
      />
      <div className="mb-8 text-center">
        <TextLink href={content.profileHref} external>
          {content.profileLabel}
        </TextLink>
      </div>

      <div className="-mx-4 grid grid-cols-2 gap-1 md:-mx-6 md:grid-cols-3 lg:grid-cols-6">
        {content.posts.map((post, i) => (
          <InstagramTile key={post.id} post={post} index={i} />
        ))}
      </div>
    </Section>
  );
}

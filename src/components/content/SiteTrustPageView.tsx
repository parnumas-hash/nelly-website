"use client";

import ContentPageLayout from "@/components/content/ContentPageLayout";
import ContentSections from "@/components/content/ContentSections";
import { useCatalog } from "@/context/CatalogContext";
import { SitePageContent } from "@/types";

interface SiteTrustPageViewProps {
  page: SitePageContent;
  eyebrow?: string;
}

export default function SiteTrustPageView({
  page,
  eyebrow = "Support",
}: SiteTrustPageViewProps) {
  const { ready } = useCatalog();

  if (!ready) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center text-neutral-400">
        Loading...
      </div>
    );
  }

  return (
    <ContentPageLayout
      eyebrow={eyebrow}
      title={page.title}
      description={page.description}
    >
      <ContentSections sections={page.sections} />
    </ContentPageLayout>
  );
}

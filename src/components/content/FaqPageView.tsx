"use client";

import ContentPageLayout from "@/components/content/ContentPageLayout";
import FaqList from "@/components/content/FaqList";
import { useCatalog } from "@/context/CatalogContext";

export default function FaqPageView() {
  const { sitePages, ready } = useCatalog();

  if (!ready) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center text-neutral-400">
        Loading...
      </div>
    );
  }

  const page = sitePages.faq;

  return (
    <ContentPageLayout title={page.title} description={page.description}>
      <FaqList items={page.items} />
    </ContentPageLayout>
  );
}

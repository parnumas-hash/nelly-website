"use client";

import SiteTrustPageView from "@/components/content/SiteTrustPageView";
import { useCatalog } from "@/context/CatalogContext";

export default function PrivacyPageClient() {
  const { sitePages, ready } = useCatalog();

  if (!ready) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center text-neutral-400">
        Loading...
      </div>
    );
  }

  return <SiteTrustPageView page={sitePages.privacy} eyebrow="Legal" />;
}

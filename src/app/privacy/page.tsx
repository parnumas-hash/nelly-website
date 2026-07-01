import type { Metadata } from "next";
import PrivacyPageClient from "@/components/content/PrivacyPageClient";
import { getDefaultSitePagesContent } from "@/lib/admin/site-pages-content";

const defaults = getDefaultSitePagesContent();

export const metadata: Metadata = {
  title: defaults.privacy.title,
  description: defaults.privacy.description,
};

export default function PrivacyPage() {
  return <PrivacyPageClient />;
}

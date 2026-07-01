import type { Metadata } from "next";
import TermsPageClient from "@/components/content/TermsPageClient";
import { getDefaultSitePagesContent } from "@/lib/admin/site-pages-content";

const defaults = getDefaultSitePagesContent();

export const metadata: Metadata = {
  title: defaults.terms.title,
  description: defaults.terms.description,
};

export default function TermsPage() {
  return <TermsPageClient />;
}

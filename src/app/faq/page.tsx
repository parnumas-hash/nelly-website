import type { Metadata } from "next";
import FaqPageView from "@/components/content/FaqPageView";
import { getDefaultSitePagesContent } from "@/lib/admin/site-pages-content";

const defaults = getDefaultSitePagesContent();

export const metadata: Metadata = {
  title: defaults.faq.title,
  description: defaults.faq.description,
};

export default function FaqPage() {
  return <FaqPageView />;
}

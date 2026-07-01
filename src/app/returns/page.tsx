import type { Metadata } from "next";
import ReturnsPageClient from "@/components/content/ReturnsPageClient";
import { getDefaultSitePagesContent } from "@/lib/admin/site-pages-content";

const defaults = getDefaultSitePagesContent();

export const metadata: Metadata = {
  title: defaults.returns.title,
  description: defaults.returns.description,
};

export default function ReturnsPage() {
  return <ReturnsPageClient />;
}

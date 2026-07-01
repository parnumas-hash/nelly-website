import type { Metadata } from "next";
import ShippingPageClient from "@/components/content/ShippingPageClient";
import { getDefaultSitePagesContent } from "@/lib/admin/site-pages-content";

const defaults = getDefaultSitePagesContent();

export const metadata: Metadata = {
  title: defaults.shipping.title,
  description: defaults.shipping.description,
};

export default function ShippingPage() {
  return <ShippingPageClient />;
}

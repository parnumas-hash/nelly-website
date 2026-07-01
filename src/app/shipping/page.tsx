import type { Metadata } from "next";
import ShippingPageClient from "@/components/content/ShippingPageClient";
import { generateTrustPageMetadata } from "@/lib/server/trust-page-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return generateTrustPageMetadata("shipping");
}

export default function ShippingPage() {
  return <ShippingPageClient />;
}

import type { Metadata } from "next";
import TermsPageClient from "@/components/content/TermsPageClient";
import { generateTrustPageMetadata } from "@/lib/server/trust-page-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return generateTrustPageMetadata("terms");
}

export default function TermsPage() {
  return <TermsPageClient />;
}

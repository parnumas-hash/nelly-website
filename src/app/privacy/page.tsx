import type { Metadata } from "next";
import PrivacyPageClient from "@/components/content/PrivacyPageClient";
import { generateTrustPageMetadata } from "@/lib/server/trust-page-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return generateTrustPageMetadata("privacy");
}

export default function PrivacyPage() {
  return <PrivacyPageClient />;
}

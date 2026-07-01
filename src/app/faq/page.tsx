import type { Metadata } from "next";
import FaqPageView from "@/components/content/FaqPageView";
import { generateTrustPageMetadata } from "@/lib/server/trust-page-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return generateTrustPageMetadata("faq");
}

export default function FaqPage() {
  return <FaqPageView />;
}

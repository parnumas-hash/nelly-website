import type { Metadata } from "next";
import ReturnsPageClient from "@/components/content/ReturnsPageClient";
import { generateTrustPageMetadata } from "@/lib/server/trust-page-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return generateTrustPageMetadata("returns");
}

export default function ReturnsPage() {
  return <ReturnsPageClient />;
}

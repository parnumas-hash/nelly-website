import type { Metadata } from "next";
import HowToShopPageView from "@/components/content/HowToShopPageView";
import { generateTrustPageMetadata } from "@/lib/server/trust-page-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return generateTrustPageMetadata("howToShop");
}

export default function HowToShopPage() {
  return <HowToShopPageView />;
}

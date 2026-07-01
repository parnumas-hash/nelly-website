import type { Metadata } from "next";
import HowToShopPageView from "@/components/content/HowToShopPageView";
import { getDefaultSitePagesContent } from "@/lib/admin/site-pages-content";

const defaults = getDefaultSitePagesContent();

export const metadata: Metadata = {
  title: defaults.howToShop.title,
  description: defaults.howToShop.description,
};

export default function HowToShopPage() {
  return <HowToShopPageView />;
}

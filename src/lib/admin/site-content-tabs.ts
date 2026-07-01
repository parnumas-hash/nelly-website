import type { HomeCollectionKey } from "@/types";

export interface SiteContentTab {
  href: string;
  label: string;
  collectionKey?: HomeCollectionKey;
}

const tabs: SiteContentTab[] = [
  { href: "/admin/site-content/about", label: "About Us" },
  { href: "/admin/site-content/benefits", label: "Benefits" },
  { href: "/admin/site-content/best-seller", label: "Best Seller" },
  { href: "/admin/site-content/brand-story", label: "Brand Story" },
  {
    href: "/admin/site-content/eco-friendly",
    label: "Eco Friendly",
    collectionKey: "eco",
  },
  { href: "/admin/site-content/first-adventure", label: "First Adventure" },
  { href: "/admin/site-content/footer", label: "Footer" },
  { href: "/admin/site-content/banner", label: "Hero Banner" },
  {
    href: "/admin/site-content/home-living",
    label: "Home Living",
    collectionKey: "home",
  },
  { href: "/admin/site-content/instagram", label: "Instagram" },
  { href: "/admin/site-content/newsletter", label: "Newsletter" },
  { href: "/admin/site-content/new-collection", label: "New Collection" },
  { href: "/admin/site-content/store-locator", label: "Store Locator" },
  { href: "/admin/site-content/testimonials", label: "Testimonials" },
  { href: "/admin/site-content/trust-pages", label: "Trust Pages" },
  {
    href: "/admin/site-content/travel-with-pets",
    label: "Travel with Pets",
    collectionKey: "travel",
  },
];

export const SITE_CONTENT_TABS = [...tabs].sort((a, b) =>
  a.label.localeCompare(b.label, "en")
);

export function getCollectionTab(key: HomeCollectionKey): SiteContentTab {
  const tab = SITE_CONTENT_TABS.find((item) => item.collectionKey === key);
  if (!tab) {
    throw new Error(`Missing site content tab for collection: ${key}`);
  }
  return tab;
}

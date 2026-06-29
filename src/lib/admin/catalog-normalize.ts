import { CatalogSyncSnapshot } from "@/lib/admin/catalog-sync";
import {
  CATALOG_VERSION,
  getDefaultBanner,
  getDefaultBrands,
  getDefaultFooter,
  getDefaultAbout,
  getDefaultProducts,
} from "@/lib/admin/storage";
import { normalizeBrandCategories } from "@/lib/brand-categories";
import { AboutSection, FooterBranding, HeroBanner } from "@/types";

export function normalizeCatalogSnapshot(
  snapshot: Partial<CatalogSyncSnapshot> | null | undefined
): CatalogSyncSnapshot {
  const fallbackBanner = getDefaultBanner();
  const fallbackFooter = getDefaultFooter();
  const fallbackAbout = getDefaultAbout();

  return {
    catalogVersion: snapshot?.catalogVersion ?? CATALOG_VERSION,
    products: Array.isArray(snapshot?.products)
      ? snapshot!.products
      : getDefaultProducts(),
    brands: Array.isArray(snapshot?.brands)
      ? snapshot!.brands
      : getDefaultBrands(),
    categories: normalizeBrandCategories(
      Array.isArray(snapshot?.categories) ? snapshot!.categories : []
    ),
    media: Array.isArray(snapshot?.media) ? snapshot!.media : [],
    banner: {
      ...fallbackBanner,
      ...(snapshot?.banner ?? {}),
      active: snapshot?.banner?.active !== false,
    } as HeroBanner,
    footer: {
      ...fallbackFooter,
      ...(snapshot?.footer ?? {}),
    } as FooterBranding,
    about: {
      ...fallbackAbout,
      ...(snapshot?.about ?? {}),
    } as AboutSection,
  };
}

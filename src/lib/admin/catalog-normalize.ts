import { CatalogSyncSnapshot } from "@/lib/admin/catalog-sync";
import {
  CATALOG_VERSION,
  getDefaultBanner,
  getDefaultBrands,
  getDefaultProducts,
} from "@/lib/admin/storage";
import { normalizeBrandCategories } from "@/lib/brand-categories";
import { HeroBanner } from "@/types";

export function normalizeCatalogSnapshot(
  snapshot: Partial<CatalogSyncSnapshot> | null | undefined
): CatalogSyncSnapshot {
  const fallbackBanner = getDefaultBanner();

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
  };
}

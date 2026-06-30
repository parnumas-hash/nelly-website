import { CatalogSyncSnapshot } from "@/lib/admin/catalog-sync";
import {
  CATALOG_VERSION,
  getDefaultBanner,
  getDefaultBrands,
  getDefaultFooter,
  getDefaultAbout,
  getDefaultHomeCollections,
  getDefaultProducts,
} from "@/lib/admin/storage";
import { normalizeBrandCategories } from "@/lib/brand-categories";
import { AboutSection, FooterBranding, HeroBanner, HomeCollections, HomepageContent } from "@/types";
import { getDefaultHomepageContent, normalizeHomepageContent } from "@/lib/admin/homepage-content";

export function normalizeCatalogSnapshot(
  snapshot: Partial<CatalogSyncSnapshot> | null | undefined
): CatalogSyncSnapshot {
  const fallbackBanner = getDefaultBanner();
  const fallbackFooter = getDefaultFooter();
  const fallbackAbout = getDefaultAbout();
  const fallbackHomeCollections = getDefaultHomeCollections();

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
    homeCollections: {
      travel: {
        ...fallbackHomeCollections.travel,
        ...(snapshot?.homeCollections?.travel ?? {}),
      },
      home: {
        ...fallbackHomeCollections.home,
        ...(snapshot?.homeCollections?.home ?? {}),
      },
      eco: {
        ...fallbackHomeCollections.eco,
        ...(snapshot?.homeCollections?.eco ?? {}),
      },
    } as HomeCollections,
    homepageContent: normalizeHomepageContent(snapshot?.homepageContent),
  };
}

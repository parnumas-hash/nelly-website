import { AdminBrand, AdminProduct, BrandCategory, AboutSection, FooterBranding, HeroBanner, HomeCollections, HomepageContent, MediaItem } from "@/types";
import { isRemoteCatalogEnabled } from "@/lib/admin/catalog-sync";
import {
  stripAboutForLocalStorage,
  stripBannerForLocalStorage,
  stripFooterForLocalStorage,
  stripHomeCollectionsForLocalStorage,
  stripHomepageContentForLocalStorage,
} from "@/lib/admin/site-content-storage";
import {
  saveAbout,
  saveBanner,
  saveBrands,
  saveCategories,
  saveFooter,
  saveHomeCollections,
  saveHomepageContent,
  saveMedia,
  saveProducts,
  StorageQuotaError,
} from "@/lib/admin/storage";

export function isCloudCatalogMode(): boolean {
  return isRemoteCatalogEnabled();
}

function persistSiteContentSafely<T>(saveFn: (data: T) => void, data: T): void {
  if (isCloudCatalogMode()) {
    try {
      saveFn(data);
    } catch (error) {
      if (!(error instanceof StorageQuotaError)) throw error;
    }
    return;
  }

  saveFn(data);
}

export function persistProducts(products: AdminProduct[]): void {
  if (isCloudCatalogMode()) return;
  saveProducts(products);
}

export function persistBrands(brands: AdminBrand[]): void {
  if (isCloudCatalogMode()) return;
  saveBrands(brands);
}

export function persistCategories(categories: BrandCategory[]): void {
  if (isCloudCatalogMode()) return;
  saveCategories(categories);
}

export function persistMedia(media: MediaItem[]): void {
  if (isCloudCatalogMode()) return;
  saveMedia(media);
}

export function persistBanner(banner: HeroBanner): void {
  persistSiteContentSafely(
    saveBanner,
    isCloudCatalogMode() ? stripBannerForLocalStorage(banner) : banner
  );
}

export function persistFooter(footer: FooterBranding): void {
  persistSiteContentSafely(
    saveFooter,
    isCloudCatalogMode() ? stripFooterForLocalStorage(footer) : footer
  );
}

export function persistAbout(about: AboutSection): void {
  persistSiteContentSafely(
    saveAbout,
    isCloudCatalogMode() ? stripAboutForLocalStorage(about) : about
  );
}

export function persistHomeCollections(homeCollections: HomeCollections): void {
  persistSiteContentSafely(
    saveHomeCollections,
    isCloudCatalogMode()
      ? stripHomeCollectionsForLocalStorage(homeCollections)
      : homeCollections
  );
}

export function persistHomepageContent(homepageContent: HomepageContent): void {
  persistSiteContentSafely(
    saveHomepageContent,
    isCloudCatalogMode()
      ? stripHomepageContentForLocalStorage(homepageContent)
      : homepageContent
  );
}

export { StorageQuotaError };

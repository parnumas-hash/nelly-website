import { AdminBrand, AdminProduct, BrandCategory, AboutSection, FooterBranding, HeroBanner, HomeCollections, HomepageContent, MediaItem } from "@/types";
import { isRemoteCatalogEnabled } from "@/lib/admin/catalog-sync";
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
} from "@/lib/admin/storage";

export function isCloudCatalogMode(): boolean {
  return isRemoteCatalogEnabled();
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
  saveBanner(banner);
}

export function persistFooter(footer: FooterBranding): void {
  saveFooter(footer);
}

export function persistAbout(about: AboutSection): void {
  saveAbout(about);
}

export function persistHomeCollections(homeCollections: HomeCollections): void {
  saveHomeCollections(homeCollections);
}

export function persistHomepageContent(homepageContent: HomepageContent): void {
  saveHomepageContent(homepageContent);
}

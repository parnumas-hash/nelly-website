import { AdminBrand, AdminProduct, BrandCategory, AboutSection, FooterBranding, HeroBanner, MediaItem } from "@/types";
import { isRemoteCatalogEnabled } from "@/lib/admin/catalog-sync";
import {
  saveAbout,
  saveBanner,
  saveBrands,
  saveCategories,
  saveFooter,
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
  if (isCloudCatalogMode()) return;
  saveBanner(banner);
}

export function persistFooter(footer: FooterBranding): void {
  if (isCloudCatalogMode()) return;
  saveFooter(footer);
}

export function persistAbout(about: AboutSection): void {
  if (isCloudCatalogMode()) return;
  saveAbout(about);
}

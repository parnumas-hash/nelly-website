import {
  AdminBrand,
  AdminProduct,
  BrandCategory,
  HeroBanner,
  MediaItem,
} from "@/types";
import {
  CATALOG_VERSION,
  normalizeAdminProduct,
  saveBanner,
  saveBrands,
  saveCategories,
  saveMedia,
  saveProducts,
  saveCatalogVersion,
} from "@/lib/admin/storage";
import { normalizeBrandCategories, sortBrandsAlphabetically } from "@/lib/brand-categories";
import {
  enrichProductWithMedia,
  stripProductsForStorage,
} from "@/lib/media-library";
import { getSeedImagesForProduct, repairAdminProduct } from "@/lib/image-utils";

export const BACKUP_FORMAT_VERSION = 1;

export interface CatalogBackup {
  formatVersion: number;
  exportedAt: string;
  catalogVersion: number;
  app: "nelly-admin";
  products: AdminProduct[];
  brands: AdminBrand[];
  categories: BrandCategory[];
  media: MediaItem[];
  banner: HeroBanner;
}

export interface CatalogBackupSummary {
  exportedAt: string;
  productCount: number;
  brandCount: number;
  categoryCount: number;
  mediaCount: number;
}

export function createCatalogBackup(snapshot: {
  products: AdminProduct[];
  brands: AdminBrand[];
  categories: BrandCategory[];
  media: MediaItem[];
  banner: HeroBanner;
}): CatalogBackup {
  return {
    formatVersion: BACKUP_FORMAT_VERSION,
    exportedAt: new Date().toISOString(),
    catalogVersion: CATALOG_VERSION,
    app: "nelly-admin",
    products: stripProductsForStorage(snapshot.products),
    brands: snapshot.brands.map((brand) => ({ ...brand, categories: [] })),
    categories: normalizeBrandCategories(snapshot.categories),
    media: snapshot.media,
    banner: snapshot.banner,
  };
}

export function getCatalogBackupSummary(
  backup: CatalogBackup
): CatalogBackupSummary {
  return {
    exportedAt: backup.exportedAt,
    productCount: backup.products.length,
    brandCount: backup.brands.length,
    categoryCount: backup.categories.length,
    mediaCount: backup.media.length,
  };
}

export function downloadCatalogBackup(backup: CatalogBackup): void {
  const stamp = backup.exportedAt.slice(0, 10);
  const blob = new Blob([JSON.stringify(backup, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `nelly-catalog-backup-${stamp}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

function normalizeBackupBrand(brand: AdminBrand): AdminBrand {
  const hasCustom =
    brand.hasCustomImage === true ||
    (typeof brand.image === "string" &&
      (brand.image.startsWith("data:") ||
        brand.image.startsWith("http://") ||
        brand.image.startsWith("https://")));

  return {
    ...brand,
    name: brand.displayName || brand.name || "Brand",
    displayName: brand.displayName || brand.name || "Brand",
    tagline: brand.tagline ?? "",
    description: brand.description ?? "",
    slug: brand.slug || "brand",
    active: brand.active ?? true,
    hasCustomImage: hasCustom,
    image: hasCustom ? brand.image : "",
    categories: [],
  };
}

export function parseCatalogBackup(raw: string): CatalogBackup {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Backup file is not valid JSON.");
  }
  return validateCatalogBackup(parsed);
}

export function validateCatalogBackup(raw: unknown): CatalogBackup {
  if (!raw || typeof raw !== "object") {
    throw new Error("Invalid backup file.");
  }

  const data = raw as Partial<CatalogBackup>;

  if (data.app !== "nelly-admin") {
    throw new Error("This file is not a NELLY admin backup.");
  }

  if (typeof data.formatVersion !== "number") {
    throw new Error("Backup is missing format version.");
  }

  if (data.formatVersion > BACKUP_FORMAT_VERSION) {
    throw new Error("Backup was created by a newer app version.");
  }

  if (!Array.isArray(data.products)) {
    throw new Error("Backup is missing products.");
  }

  if (!Array.isArray(data.brands)) {
    throw new Error("Backup is missing brands.");
  }

  if (!Array.isArray(data.categories)) {
    throw new Error("Backup is missing categories.");
  }

  if (!Array.isArray(data.media)) {
    throw new Error("Backup is missing media.");
  }

  if (!data.banner || typeof data.banner !== "object") {
    throw new Error("Backup is missing banner settings.");
  }

  return {
    formatVersion: data.formatVersion,
    exportedAt:
      typeof data.exportedAt === "string"
        ? data.exportedAt
        : new Date().toISOString(),
    catalogVersion:
      typeof data.catalogVersion === "number"
        ? data.catalogVersion
        : CATALOG_VERSION,
    app: "nelly-admin",
    products: data.products.map((item) =>
      repairAdminProduct(normalizeAdminProduct(item))
    ),
    brands: data.brands.map((item) => normalizeBackupBrand(item)),
    categories: normalizeBrandCategories(data.categories),
    media: data.media,
    banner: data.banner as HeroBanner,
  };
}

export function applyCatalogBackup(backup: CatalogBackup): {
  products: AdminProduct[];
  brands: AdminBrand[];
  categories: BrandCategory[];
  media: MediaItem[];
  banner: HeroBanner;
} {
  const products = backup.products.map((product) =>
    enrichProductWithMedia(
      product,
      backup.media,
      getSeedImagesForProduct(product)
    )
  );

  saveProducts(stripProductsForStorage(backup.products));
  saveBrands(backup.brands);
  saveCategories(backup.categories);
  saveMedia(backup.media);
  saveBanner(backup.banner);
  saveCatalogVersion(backup.catalogVersion);

  return {
    products,
    brands: sortBrandsAlphabetically(backup.brands),
    categories: backup.categories,
    media: backup.media,
    banner: backup.banner,
  };
}

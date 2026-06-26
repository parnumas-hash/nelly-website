import {
  AdminProduct,
  AdminBrand,
  BrandCategory,
  HeroBanner,
  LegacySeedProduct,
  MediaItem,
  Product,
  ProductPetType,
  ProductVariant,
} from "@/types";
import { products as seedProducts, categories as legacyShopCategories } from "@/lib/products";
import { brands as seedBrands } from "@/lib/brands";
import { HERO_POSTER, HERO_VIDEO } from "@/lib/media";
import { slugify } from "@/lib/utils";
import { sortBrandsAlphabetically } from "@/lib/brand-categories";
import { deriveListingFields, normalizeVariant } from "@/lib/variants";
import { normalizeBrandCategories } from "@/lib/brand-categories";
import { repairProductsTaxonomy, normalizeProductPetType } from "@/lib/product-taxonomy";
import {
  enrichProductWithMedia,
  migrateCatalogToMediaRefs,
  resolveVariantImagesForDisplay,
  stripProductsForStorage,
} from "@/lib/media-library";
import {
  getSeedImagesForProduct,
  repairAdminProduct,
  sanitizeImageList,
  sanitizeImageUrl,
} from "@/lib/image-utils";

export const STORAGE_KEYS = {
  products: "nelly-admin-products",
  brands: "nelly-admin-brands",
  categories: "nelly-admin-categories",
  media: "nelly-admin-media",
  banner: "nelly-admin-banner",
  catalogVersion: "nelly-catalog-version",
} as const;

export const CATALOG_VERSION = 4;

export const STORAGE_QUOTA_MESSAGE =
  "Storage full. Please reduce image size or remove unused images.";

export class StorageQuotaError extends Error {
  constructor(message: string = STORAGE_QUOTA_MESSAGE) {
    super(message);
    this.name = "StorageQuotaError";
  }
}

function read<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    const isQuota =
      error instanceof DOMException &&
      (error.name === "QuotaExceededError" ||
        error.code === 22 ||
        error.code === 1014);
    if (isQuota) {
      throw new StorageQuotaError();
    }
    throw error;
  }
}

export function buildVariantsFromLegacy(
  product: LegacySeedProduct,
  productIndex: number
): ProductVariant[] {
  const hasSale = !!product.originalPrice;
  const basePrice = hasSale ? product.originalPrice! : product.price;
  const salePrice = hasSale ? product.price : undefined;
  const variants: ProductVariant[] = [];
  let vi = 0;

  for (const color of product.colors) {
    for (const size of product.sizes) {
      vi += 1;
      variants.push({
        id: `v-${product.id}-${vi}`,
        color,
        size,
        sku: `NELLY-${String(productIndex + 1).padStart(4, "0")}-${String(vi).padStart(2, "0")}`,
        barcode: "",
        price: basePrice,
        salePrice,
        stock: product.inStock ? 48 : 0,
        images: sanitizeImageList(product.images),
        status: product.inStock ? "available" : "out-of-stock",
      });
    }
  }

  return variants;
}

function migrateLegacyAdminProduct(raw: Record<string, unknown>): AdminProduct {
  const colors = (raw.colors as string[]) ?? ["Default"];
  const sizes = (raw.sizes as string[]) ?? ["One Size"];
  const images = sanitizeImageList(raw.images as string[] | undefined);
  const hasSale =
    raw.salePrice !== undefined &&
    typeof raw.salePrice === "number" &&
    raw.salePrice > 0 &&
    typeof raw.price === "number" &&
    raw.salePrice < raw.price;

  const variants: ProductVariant[] = [];
  let vi = 0;
  for (const color of colors) {
    for (const size of sizes) {
      vi += 1;
      variants.push({
        id: generateId(),
        color,
        size,
        sku:
          vi === 1 && typeof raw.sku === "string" && raw.sku
            ? raw.sku
            : `${raw.sku ?? "SKU"}-${vi}`,
        barcode: "",
        price: hasSale ? (raw.price as number) : (raw.price as number) ?? 0,
        salePrice: hasSale ? (raw.salePrice as number) : undefined,
        stock:
          vi === 1 && typeof raw.stock === "number"
            ? raw.stock
            : typeof raw.stock === "number"
              ? Math.floor(raw.stock / (colors.length * sizes.length)) || 0
              : 0,
        images: vi === 1 ? images : [...images],
        status:
          typeof raw.stock === "number" && raw.stock > 0
            ? "available"
            : "out-of-stock",
      });
    }
  }

  return {
    id: raw.id as string,
    slug: raw.slug as string,
    name: raw.name as string,
    brand: raw.brand as string,
    brandId: (raw.brandId as string) ?? "",
    petType: normalizeProductPetType(raw.petType),
    categoryId: (raw.categoryId as string) ?? "",
    subCategoryName: (raw.subCategoryName as string) ?? "",
    description: raw.description as string,
    longDescription: (raw.longDescription as string) ?? (raw.description as string),
    category: raw.category as string,
    variants,
    featured: !!raw.featured,
    isNew: !!raw.isNew,
    bestSeller: !!raw.bestSeller,
    rating: (raw.rating as number) ?? 4.8,
    reviewCount: (raw.reviewCount as number) ?? 0,
    tags: (raw.tags as string[]) ?? [],
    status: (raw.status as AdminProduct["status"]) ?? "published",
    updatedAt: (raw.updatedAt as string) ?? new Date().toISOString(),
  };
}

export function normalizeAdminProduct(raw: unknown): AdminProduct {
  const p = raw as Record<string, unknown>;
  const hasVariants = Array.isArray(p.variants) && p.variants.length > 0;
  const base = hasVariants
    ? (raw as AdminProduct)
    : migrateLegacyAdminProduct(p);

  const variants = (Array.isArray(base.variants) ? base.variants : []).map(
    (v, i) =>
      normalizeVariant({
        ...(v as ProductVariant),
        id:
          typeof (v as ProductVariant).id === "string"
            ? (v as ProductVariant).id
            : `v-${base.id}-${i + 1}`,
      })
  );

  return repairAdminProduct({
    ...base,
    variants,
  });
}

function mergeWithSeedDefaults(products: AdminProduct[]): AdminProduct[] {
  const defaults = getDefaultProducts();

  const mergedDefaults = defaults.map((seed) => {
    const existing = products.find(
      (p) => p.slug === seed.slug || p.id === seed.id
    );
    if (!existing) return seed;

    return repairAdminProduct({
      ...seed,
      ...existing,
      name: existing.name || seed.name,
      brand: existing.brand || seed.brand,
      category: existing.category || seed.category,
      description: existing.description || seed.description,
      longDescription: existing.longDescription || seed.longDescription,
      isNew: typeof existing.isNew === "boolean" ? existing.isNew : seed.isNew,
      bestSeller:
        typeof existing.bestSeller === "boolean"
          ? existing.bestSeller
          : seed.bestSeller,
      featured:
        typeof existing.featured === "boolean"
          ? existing.featured
          : seed.featured,
      status: existing.status === "draft" ? "draft" : "published",
      petType: normalizeProductPetType(existing.petType),
      categoryId: existing.categoryId ?? "",
      brandId: existing.brandId ?? "",
      variants:
        existing.variants.length > 0 ? existing.variants : seed.variants,
      tags: existing.tags?.length ? existing.tags : seed.tags,
    });
  });

  const customProducts = products
    .filter((p) => !defaults.some((d) => d.id === p.id || d.slug === p.slug))
    .map(repairAdminProduct);

  return [...mergedDefaults, ...customProducts];
}

export function seedProductToAdmin(
  product: LegacySeedProduct,
  index: number
): AdminProduct {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    brand: product.brand,
    brandId: "",
    petType: "dog",
    categoryId: "",
    subCategoryName: "",
    description: product.description,
    longDescription: product.longDescription,
    category: product.category,
    variants: buildVariantsFromLegacy(product, index),
    featured: product.featured,
    isNew: product.isNew,
    bestSeller: product.bestSeller,
    rating: product.rating,
    reviewCount: product.reviewCount,
    tags: product.tags,
    status: "published",
    updatedAt: new Date().toISOString(),
  };
}

export function adminToStorefront(
  product: AdminProduct,
  media: MediaItem[] = []
): Product {
  const repaired = repairAdminProduct(product);
  const seedImages = getSeedImagesForProduct(repaired);
  const variants = repaired.variants.map((v, i) =>
    normalizeVariant({
      ...v,
      id: v.id ?? `v-${repaired.id}-${i + 1}`,
      images: resolveVariantImagesForDisplay(v, media, seedImages),
    })
  );

  const listing = deriveListingFields(variants, {
    images: seedImages,
    inStock: variants.some(
      (v) => v.status !== "out-of-stock" && (v.stock ?? 0) > 0
    ),
  });

  return {
    id: repaired.id,
    slug: repaired.slug,
    name: repaired.name,
    brand: repaired.brand,
    brandId: repaired.brandId,
    petType: normalizeProductPetType(repaired.petType),
    categoryId: repaired.categoryId,
    subCategoryName: repaired.subCategoryName,
    description: repaired.description,
    longDescription: repaired.longDescription || repaired.description,
    category: repaired.category,
    variants,
    price: listing.price,
    originalPrice: listing.originalPrice,
    images: sanitizeImageList(listing.images, seedImages),
    colors: listing.colors,
    sizes: listing.sizes,
    inStock: listing.inStock,
    featured: repaired.featured,
    isNew: repaired.isNew,
    bestSeller: repaired.bestSeller,
    rating: repaired.rating,
    reviewCount: repaired.reviewCount,
    tags: repaired.tags,
  };
}

export function getDefaultProducts(): AdminProduct[] {
  return seedProducts.map(seedProductToAdmin);
}

export function getDefaultBrands(): AdminBrand[] {
  return seedBrands.map((b) => ({
    ...b,
    active: true,
    image: "",
    hasCustomImage: false,
    categories: [],
  }));
}

function normalizeAdminBrand(stored: AdminBrand, seed: AdminBrand): AdminBrand {
  const hasCustom =
    typeof stored.image === "string" && stored.image.startsWith("data:");

  return {
    ...seed,
    ...stored,
    name: stored.displayName || stored.name || seed.name,
    displayName: stored.displayName || seed.displayName,
    tagline: stored.tagline ?? seed.tagline,
    description: stored.description || seed.description,
    slug: stored.slug || seed.slug,
    active: stored.active ?? true,
    hasCustomImage: hasCustom,
    image: hasCustom ? stored.image : "",
    categories: [],
  };
}

export function getDefaultBanner(): HeroBanner {
  return {
    eyebrow: "AIRBUGGY PET",
    title: "Premium Pet Lifestyle",
    subtitle: "A New Journey With Your Best Friend",
    ctaLabel: "Explore Collection",
    ctaHref: "/shop?brand=airbuggy-pet",
    videoUrl: HERO_VIDEO,
    posterUrl: HERO_POSTER,
    active: true,
  };
}

export function loadProducts(): AdminProduct[] {
  const stored = read<unknown[]>(STORAGE_KEYS.products);
  if (!stored || !Array.isArray(stored) || stored.length === 0) {
    return getDefaultProducts();
  }
  return stored.map(normalizeAdminProduct);
}

export function saveProducts(products: AdminProduct[]): void {
  write(STORAGE_KEYS.products, stripProductsForStorage(products));
}

export function loadBrands(): AdminBrand[] {
  const defaults = getDefaultBrands();
  const stored = read<AdminBrand[]>(STORAGE_KEYS.brands);
  if (!stored) return sortBrandsAlphabetically(defaults);

  const mergedDefaults = defaults.map((seed) => {
    const saved = stored.find((b) => b.id === seed.id);
    return saved ? normalizeAdminBrand(saved, seed) : seed;
  });

  const customBrands = stored
    .filter((b) => !defaults.some((d) => d.id === b.id))
    .map(normalizeCustomBrand);

  return sortBrandsAlphabetically([...mergedDefaults, ...customBrands]);
}

function normalizeCustomBrand(stored: AdminBrand): AdminBrand {
  const hasCustom =
    typeof stored.image === "string" && stored.image.startsWith("data:");

  return {
    ...stored,
    name: stored.displayName || stored.name || "Brand",
    displayName: stored.displayName || stored.name || "Brand",
    tagline: stored.tagline ?? "",
    description: stored.description ?? "",
    slug: stored.slug || slugify(stored.displayName || stored.name || "brand"),
    active: stored.active ?? true,
    hasCustomImage: hasCustom,
    image: hasCustom ? stored.image : "",
    categories: [],
  };
}

export function saveBrands(brands: AdminBrand[]): void {
  write(
    STORAGE_KEYS.brands,
    brands.map((brand) => ({ ...brand, categories: [] }))
  );
}

export function loadCategories(): BrandCategory[] {
  const stored = read<BrandCategory[]>(STORAGE_KEYS.categories);
  return normalizeBrandCategories(stored ?? undefined);
}

export function saveCategories(categories: BrandCategory[]): void {
  write(STORAGE_KEYS.categories, normalizeBrandCategories(categories));
}

function migrateCategoriesFromBrands(brands: AdminBrand[]): BrandCategory[] {
  const seen = new Set<string>();
  const flattened: BrandCategory[] = [];

  for (const brand of brands) {
    for (const category of brand.categories ?? []) {
      if (seen.has(category.id)) continue;
      seen.add(category.id);
      flattened.push(category);
    }
  }

  return normalizeBrandCategories(flattened);
}

function formatCategoryLabel(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function deriveCategoriesFromProducts(products: AdminProduct[]): BrandCategory[] {
  const seen = new Set<string>();
  const result: BrandCategory[] = [];
  let sortOrder = 0;

  const addCategory = (
    id: string,
    slug: string,
    name: string,
    petType: BrandCategory["petType"] = "both"
  ) => {
    const key = id || slug;
    if (!key || seen.has(key) || seen.has(slug)) return;
    seen.add(key);
    seen.add(slug);
    result.push({
      id: key,
      name,
      slug,
      petType,
      sortOrder: sortOrder++,
      active: true,
    });
  };

  for (const product of products) {
    if (product.categoryId) {
      const legacy = legacyShopCategories.find(
        (item) =>
          item.id === product.categoryId || item.slug === product.categoryId
      );
      const slug = legacy?.slug ?? product.categoryId;
      const petType: BrandCategory["petType"] =
        product.petType === "dog" || product.petType === "cat"
          ? product.petType
          : "both";
      addCategory(
        product.categoryId,
        slug,
        legacy?.name ?? formatCategoryLabel(slug),
        petType
      );
    }

    if (product.category && product.category !== "all") {
      const legacy = legacyShopCategories.find(
        (item) =>
          item.id === product.category || item.slug === product.category
      );
      const slug = legacy?.slug ?? product.category;
      addCategory(
        legacy?.id ?? slug,
        slug,
        legacy?.name ?? formatCategoryLabel(slug),
        "both"
      );
    }
  }

  return normalizeBrandCategories(result);
}

export function getDefaultCategories(): BrandCategory[] {
  return normalizeBrandCategories(
    legacyShopCategories
      .filter((category) => category.slug !== "all")
      .map((category, index) => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        petType: "both" as const,
        sortOrder: index,
        active: true,
      }))
  );
}

function ensureGlobalCategories(
  categories: BrandCategory[],
  brands: AdminBrand[],
  products: AdminProduct[]
): { categories: BrandCategory[]; brands: AdminBrand[]; changed: boolean } {
  if (categories.length > 0) {
    return { categories, brands, changed: false };
  }

  const storedCategories = read<BrandCategory[]>(STORAGE_KEYS.categories);
  const rawBrands = read<AdminBrand[]>(STORAGE_KEYS.brands);
  let nextCategories = migrateCategoriesFromBrands(rawBrands ?? brands);

  if (nextCategories.length === 0) {
    nextCategories = deriveCategoriesFromProducts(products);
  }

  if (nextCategories.length === 0 && storedCategories === null) {
    nextCategories = getDefaultCategories();
  }

  if (nextCategories.length === 0) {
    return { categories, brands, changed: false };
  }

  const nextBrands = brands.map((brand) => ({ ...brand, categories: [] }));
  return { categories: nextCategories, brands: nextBrands, changed: true };
}

export function loadMedia(): MediaItem[] {
  return read<MediaItem[]>(STORAGE_KEYS.media) ?? [];
}

export function saveMedia(media: MediaItem[]): void {
  write(STORAGE_KEYS.media, media);
}

export function loadBanner(): HeroBanner {
  const stored = read<HeroBanner>(STORAGE_KEYS.banner);
  const defaults = getDefaultBanner();
  const banner = stored ?? defaults;
  return {
    ...defaults,
    ...banner,
    posterUrl: sanitizeImageUrl(banner.posterUrl, defaults.posterUrl),
    videoUrl: banner.videoUrl || defaults.videoUrl,
    active: banner.active !== false,
  };
}

export function saveBanner(banner: HeroBanner): void {
  write(STORAGE_KEYS.banner, banner);
}

export function saveCatalogVersion(version: number): void {
  write(STORAGE_KEYS.catalogVersion, version);
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function generateSlug(name: string, existing: string[]): string {
  const base = slugify(name);
  let slug = base;
  let i = 1;
  while (existing.includes(slug)) {
    slug = `${base}-${i++}`;
  }
  return slug;
}

export function clearAdminStorage(): void {
  if (typeof window === "undefined") return;
  Object.values(STORAGE_KEYS).forEach((key) => {
    try {
      localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  });
}

export function resetAdminStorageToDefaults(): {
  products: AdminProduct[];
  brands: AdminBrand[];
  categories: BrandCategory[];
  media: MediaItem[];
  banner: HeroBanner;
} {
  clearAdminStorage();
  const brands = getDefaultBrands();
  const categories = getDefaultCategories();
  const products = repairProductsTaxonomy(getDefaultProducts(), brands);
  const media: MediaItem[] = [];
  const banner = getDefaultBanner();
  write(STORAGE_KEYS.catalogVersion, CATALOG_VERSION);
  saveProducts(products);
  saveBrands(brands);
  saveCategories(categories);
  saveMedia(media);
  saveBanner(banner);
  return { products, brands, categories, media, banner };
}

export function initializeCatalogFromStorage(): {
  products: AdminProduct[];
  brands: AdminBrand[];
  categories: BrandCategory[];
  media: MediaItem[];
  banner: HeroBanner;
  migrated: boolean;
} {
  let media = loadMedia();
  let brands = loadBrands();
  let categories = loadCategories();
  const banner = loadBanner();
  const version = read<number>(STORAGE_KEYS.catalogVersion);
  const stored = read<unknown[]>(STORAGE_KEYS.products);
  const defaults = getDefaultProducts();

  let products: AdminProduct[];

  if (!stored || !Array.isArray(stored) || stored.length === 0) {
    products = defaults;
    write(STORAGE_KEYS.catalogVersion, CATALOG_VERSION);
  } else {
    const normalized = stored.map(normalizeAdminProduct);
    const hasPublished = normalized.some((p) => p.status === "published");

    products = hasPublished
      ? mergeWithSeedDefaults(normalized)
      : [
          ...defaults,
          ...normalized.filter((p) => !defaults.some((d) => d.slug === p.slug)),
        ];

    if (version !== CATALOG_VERSION) {
      products = mergeWithSeedDefaults(products);
      write(STORAGE_KEYS.catalogVersion, CATALOG_VERSION);
    }
  }

  const migration = migrateCatalogToMediaRefs(products, media);
  products = migration.products;
  media = migration.media;

  products = repairProductsTaxonomy(products, brands);

  const categorySync = ensureGlobalCategories(categories, brands, products);
  categories = categorySync.categories;
  brands = categorySync.brands;

  if (categorySync.changed) {
    try {
      saveBrands(brands);
      saveCategories(categories);
      write(STORAGE_KEYS.catalogVersion, CATALOG_VERSION);
    } catch (error) {
      if (!(error instanceof StorageQuotaError)) {
        throw error;
      }
    }
  } else if (version !== CATALOG_VERSION) {
    write(STORAGE_KEYS.catalogVersion, CATALOG_VERSION);
  }

  const enriched = products.map((product) =>
    enrichProductWithMedia(product, media, getSeedImagesForProduct(product))
  );

  let migrated = migration.changed || categorySync.changed;

  try {
    if (migration.changed) {
      saveMedia(media);
      migrated = true;
    }
    saveProducts(enriched);
  } catch (error) {
    if (!(error instanceof StorageQuotaError)) {
      throw error;
    }
  }

  return { products: enriched, brands, categories, media, banner, migrated };
}

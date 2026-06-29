import { images } from "@/lib/images";
import { products as seedProducts } from "@/lib/products";
import { AdminProduct, BrandCategory, Product, ProductVariant } from "@/types";

/** Local fallback — always available, never 404 */
export const PLACEHOLDER_IMAGE = "/images/placeholder.svg";
export const BRAND_PLACEHOLDER = "/images/brand-placeholder.svg";

/** Map legacy broken string paths to real URLs */
const LEGACY_PATH_MAP: Record<string, string> = {
  "images.pets.golden": images.pets.golden,
  "images.pets.catBed": images.pets.catBed,
  "images.pets.dogCollar": images.pets.dogCollar,
  "images.pets.dogHappy": images.pets.dogHappy,
  "images.pets.stroller": images.pets.stroller,
  "images.pets.grooming": images.pets.grooming,
  "images.pets.puppy": images.pets.puppy,
  "images.pets.treats": images.pets.treats,
  "images.pets.toys": images.pets.toys,
  "images.hero.poster": images.hero.poster,
};

const seedBySlug = new Map(seedProducts.map((p) => [p.slug, p]));
const seedById = new Map(seedProducts.map((p) => [p.id, p]));

/** Seed demo images apply only while the product still matches its original seed row. */
function getMatchingSeedProduct(
  product: Pick<AdminProduct | Product, "id" | "slug" | "name">
) {
  const bySlug = seedBySlug.get(product.slug);
  if (bySlug && bySlug.name === product.name) return bySlug;

  const byId = seedById.get(product.id);
  if (byId && byId.name === product.name) return byId;

  return undefined;
}

export function isValidImageUrl(url: unknown): url is string {
  if (typeof url !== "string") return false;
  const trimmed = url.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith("images.")) return false;
  if (trimmed.startsWith("data:")) return true;
  if (trimmed.startsWith("/")) return true;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return true;
  }
  return false;
}

export function resolveLegacyImagePath(path: string): string | null {
  if (LEGACY_PATH_MAP[path]) return LEGACY_PATH_MAP[path];
  return null;
}

export function sanitizeImageUrl(
  url: unknown,
  fallback: string = PLACEHOLDER_IMAGE
): string {
  if (typeof url === "string") {
    const legacy = resolveLegacyImagePath(url.trim());
    if (legacy) return legacy;
    if (isValidImageUrl(url)) return url.trim();
  }
  return fallback;
}

export function sanitizeImageList(
  urls: unknown,
  fallback: string[] = [PLACEHOLDER_IMAGE]
): string[] {
  if (!Array.isArray(urls)) return [...fallback];

  const sanitized = urls
    .map((url) => sanitizeImageUrl(url, ""))
    .filter((url) => url.length > 0);

  const unique = [...new Set(sanitized)];
  return unique.length > 0 ? unique : [...fallback];
}

export function getSeedImagesForProduct(
  product: Pick<AdminProduct | Product, "id" | "slug" | "name">
): string[] {
  const seed = getMatchingSeedProduct(product);
  if (!seed?.images?.length) return [PLACEHOLDER_IMAGE];
  return sanitizeImageList(seed.images);
}

export function repairVariantImages(
  variant: ProductVariant,
  productFallback: string[]
): ProductVariant {
  const fallback =
    productFallback.length > 0 ? productFallback : [PLACEHOLDER_IMAGE];
  const imageIds = variant.imageIds ?? [];
  const displayImages = sanitizeImageList(variant.images, []);

  return {
    ...variant,
    imageIds,
    images:
      displayImages.length > 0
        ? displayImages
        : imageIds.length > 0
          ? []
          : fallback,
  };
}

export function repairAdminProduct(product: AdminProduct): AdminProduct {
  const seedImages = getSeedImagesForProduct(product);
  const legacyImages = sanitizeImageList(
    (product as AdminProduct & { images?: string[] }).images,
    seedImages
  );
  const productFallback =
    legacyImages.length > 0 && legacyImages[0] !== PLACEHOLDER_IMAGE
      ? legacyImages
      : seedImages;

  const variants = (product.variants ?? []).map((v) =>
    repairVariantImages(normalizeVariantImages(v), productFallback)
  );

  return { ...product, variants };
}

function normalizeVariantImages(v: ProductVariant): ProductVariant {
  return {
    ...v,
    images: Array.isArray(v.images) ? v.images : [],
  };
}

export function repairStorefrontProduct(product: Product): Product {
  const seedImages = getSeedImagesForProduct(product);
  const productImages = sanitizeImageList(product.images, seedImages);

  const variants = (product.variants ?? []).map((v) =>
    repairVariantImages(v, productImages)
  );

  const listingImages = sanitizeImageList(
    variants.flatMap((v) => v.images),
    productImages.length > 0 ? productImages : seedImages
  );

  return {
    ...product,
    variants,
    images: listingImages,
  };
}

export function getProductPrimaryImage(product: Product): string {
  const repaired = repairStorefrontProduct(product);
  const inStockVariant = repaired.variants.find(
    (v) =>
      v.images.length > 0 &&
      v.status !== "out-of-stock" &&
      (v.stock ?? 0) > 0
  );
  const anyVariant = repaired.variants.find((v) => v.images.length > 0);

  return (
    inStockVariant?.images[0] ??
    anyVariant?.images[0] ??
    repaired.images[0] ??
    PLACEHOLDER_IMAGE
  );
}

export function getProductDisplayImages(product: Product): string[] {
  return repairStorefrontProduct(product).images;
}

export function getVariantDisplayImages(
  variant: ProductVariant | undefined | null,
  product: Product
): string[] {
  if (!variant) return getProductDisplayImages(product);

  const variantImages = sanitizeImageList(variant.images, []);
  if (variantImages.length > 0) return variantImages;

  return [PLACEHOLDER_IMAGE];
}

export function isDataUrl(src: string): boolean {
  return src.startsWith("data:");
}

export function isLocalImage(src: string): boolean {
  return src.startsWith("/");
}

export function isCatalogMediaUrl(src: string): boolean {
  return src.includes("/storage/v1/object/public/catalog-media/");
}

export function shouldUnoptimize(src: string): boolean {
  if (!src) return false;
  return isDataUrl(src) || isLocalImage(src) || isCatalogMediaUrl(src);
}

/** Hero banner — skip Next.js recompression for maximum sharpness. */
export function shouldUnoptimizeBanner(src: string): boolean {
  return shouldUnoptimize(src);
}

export function hasBrandCustomImage(
  brand: Pick<{ image?: string; hasCustomImage?: boolean }, "image" | "hasCustomImage">
): boolean {
  return getBrandDisplayImage(brand) !== null;
}

export function getBrandDisplayImage(
  brand: Pick<{ image?: string; hasCustomImage?: boolean }, "image" | "hasCustomImage">
): string | null {
  const image = brand.image;
  if (typeof image !== "string" || !image.trim()) return null;

  const isData = image.startsWith("data:");
  const isLocal = image.startsWith("/");
  const isRemote = isValidImageUrl(image) && !isData && !isLocal;

  if (!isData && !isLocal && !isRemote) return null;
  if (brand.hasCustomImage || isData || isLocal || isRemote) return image;
  return null;
}

export function resolveCategoryImageUrl(
  category: Pick<BrandCategory, "imageId">,
  getMediaUrl?: (id: string) => string
): string {
  const ref = category.imageId;
  if (!ref) return PLACEHOLDER_IMAGE;
  if (isValidImageUrl(ref)) return ref;
  if (getMediaUrl) {
    const url = getMediaUrl(ref);
    if (url !== PLACEHOLDER_IMAGE) return url;
  }
  return PLACEHOLDER_IMAGE;
}

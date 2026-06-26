import { AdminProduct, CartItem, Product, ProductVariant } from "@/types";
import {
  PLACEHOLDER_IMAGE,
  getProductPrimaryImage,
  getSeedImagesForProduct,
  getVariantDisplayImages,
  sanitizeImageList,
} from "@/lib/image-utils";

export interface PriceFallback {
  price?: number;
  originalPrice?: number;
}

export function hasProductVariants(
  product: { variants?: ProductVariant[] | null }
): boolean {
  return Array.isArray(product.variants) && product.variants.length > 0;
}

export function getProductVariantsSafe(
  product: Pick<Product, "variants">
): ProductVariant[] {
  return Array.isArray(product.variants) ? product.variants : [];
}

export function normalizeVariant(
  raw: Partial<ProductVariant> & Pick<ProductVariant, "id">
): ProductVariant {
  const imageIds = Array.isArray(raw.imageIds)
    ? raw.imageIds.filter(Boolean)
    : [];
  const images = sanitizeImageList(raw.images, [PLACEHOLDER_IMAGE]);

  return {
    id: raw.id,
    color: raw.color ?? "Default",
    size: raw.size ?? "One Size",
    scent: raw.scent ?? "",
    sku: raw.sku ?? "",
    barcode: raw.barcode ?? "",
    price: typeof raw.price === "number" ? raw.price : 0,
    salePrice:
      typeof raw.salePrice === "number" && raw.salePrice > 0
        ? raw.salePrice
        : undefined,
    stock: typeof raw.stock === "number" ? raw.stock : 0,
    imageIds,
    images,
    status: raw.status === "out-of-stock" ? "out-of-stock" : "available",
  };
}

export function getVariantDisplayPrice(
  variant?: ProductVariant | null,
  fallback?: PriceFallback
): { price: number; originalPrice?: number } {
  if (variant) {
    const basePrice =
      typeof variant.price === "number"
        ? variant.price
        : (fallback?.price ?? 0);
    const salePrice = variant.salePrice;
    const onSale =
      typeof salePrice === "number" &&
      salePrice > 0 &&
      salePrice < basePrice;

    return {
      price: onSale ? salePrice : basePrice,
      originalPrice: onSale ? basePrice : undefined,
    };
  }

  if (fallback) {
    const displayPrice = fallback.price ?? 0;
    const compareAt = fallback.originalPrice;

    if (
      typeof compareAt === "number" &&
      compareAt > 0 &&
      displayPrice < compareAt
    ) {
      return { price: displayPrice, originalPrice: compareAt };
    }

    return { price: displayPrice, originalPrice: undefined };
  }

  return { price: 0 };
}

export function isVariantInStock(variant?: ProductVariant | null): boolean {
  if (!variant) return false;
  const stock = typeof variant.stock === "number" ? variant.stock : 0;
  return variant.status !== "out-of-stock" && stock > 0;
}

export function getUniqueColors(variants?: ProductVariant[] | null): string[] {
  const list = Array.isArray(variants) ? variants : [];
  return [...new Set(list.map((v) => v.color).filter(Boolean))];
}

export function getUniqueSizes(
  variants?: ProductVariant[] | null,
  color?: string,
  scent?: string
): string[] {
  let list = Array.isArray(variants) ? variants : [];
  if (color) list = list.filter((v) => v.color === color);
  if (scent !== undefined) {
    list = list.filter((v) => (v.scent ?? "") === scent);
  }
  return [...new Set(list.map((v) => v.size).filter(Boolean))];
}

export function getUniqueScents(
  variants?: ProductVariant[] | null,
  color?: string,
  size?: string
): string[] {
  let list = Array.isArray(variants) ? variants : [];
  if (color) list = list.filter((v) => v.color === color);
  if (size) list = list.filter((v) => v.size === size);
  return [...new Set(list.map((v) => v.scent ?? "").filter(Boolean))];
}

export function findVariant(
  variants: ProductVariant[] | undefined | null,
  color: string,
  size: string,
  scent = ""
): ProductVariant | undefined {
  const list = Array.isArray(variants) ? variants : [];
  const normalizedScent = scent ?? "";
  return list.find(
    (v) =>
      v.color === color &&
      v.size === size &&
      (v.scent ?? "") === normalizedScent
  );
}

export function formatVariantLabel(variant: Pick<ProductVariant, "color" | "size" | "scent">): string {
  const parts = [variant.color, variant.size];
  if (variant.scent) parts.push(variant.scent);
  return parts.join(" / ");
}

export function deriveListingFields(
  variants?: ProductVariant[] | null,
  fallback?: PriceFallback & {
    images?: string[];
    colors?: string[];
    sizes?: string[];
    inStock?: boolean;
  }
): {
  price: number;
  originalPrice?: number;
  images: string[];
  colors: string[];
  sizes: string[];
  inStock: boolean;
} {
  const list = Array.isArray(variants) ? variants : [];

  if (!list.length) {
    const priceInfo = getVariantDisplayPrice(null, fallback);
    return {
      price: priceInfo.price,
      originalPrice: priceInfo.originalPrice,
      images: fallback?.images ?? [],
      colors: fallback?.colors ?? [],
      sizes: fallback?.sizes ?? [],
      inStock: fallback?.inStock ?? false,
    };
  }

  const displayPrices = list.map((v) => getVariantDisplayPrice(v, fallback));
  const minPrice = Math.min(...displayPrices.map((d) => d.price));
  const cheapest = displayPrices.find((d) => d.price === minPrice);
  const firstWithImages = list.find(
    (v) => Array.isArray(v.images) && v.images.length > 0
  );

  return {
    price: minPrice,
    originalPrice: cheapest?.originalPrice,
    images: firstWithImages?.images ?? fallback?.images ?? [],
    colors: getUniqueColors(list),
    sizes: getUniqueSizes(list),
    inStock: list.some(isVariantInStock),
  };
}

export function createSyntheticVariantFromProduct(
  product: Product,
  color?: string,
  size?: string
): ProductVariant {
  const { price, originalPrice } = getVariantDisplayPrice(null, {
    price: product.price,
    originalPrice: product.originalPrice,
  });
  const hasSale = originalPrice !== undefined;

  return {
    id: `legacy-${product.id}`,
    color: color ?? product.colors?.[0] ?? "Default",
    size: size ?? product.sizes?.[0] ?? "One Size",
    scent: "",
    sku: `SKU-${product.id}`,
    barcode: "",
    price: hasSale ? originalPrice! : price,
    salePrice: hasSale ? price : undefined,
    stock: product.inStock ? 99 : 0,
    images: sanitizeImageList(product.images, [PLACEHOLDER_IMAGE]),
    status: product.inStock ? "available" : "out-of-stock",
  };
}

export function resolveCartVariant(item: CartItem): ProductVariant {
  if (item.variant?.id) {
    return normalizeVariant(item.variant);
  }

  const variants = getProductVariantsSafe(item.product);

  if (hasProductVariants(item.product)) {
    const matched = findVariant(
      variants,
      item.selectedColor ?? item.product.colors?.[0] ?? "Default",
      item.selectedSize ?? item.product.sizes?.[0] ?? "One Size",
      item.selectedScent ?? ""
    );
    if (matched) return normalizeVariant(matched);
  }

  return createSyntheticVariantFromProduct(
    item.product,
    item.selectedColor,
    item.selectedSize
  );
}

export function getCartItemKey(item: CartItem): string {
  const variant = item.variant;
  const suffix =
    variant?.id ??
    `${item.selectedColor ?? "default"}-${item.selectedSize ?? "default"}-${item.selectedScent ?? "default"}`;
  return `${item.product.id}-${suffix}`;
}

export function getCartItemPrice(item: CartItem): number {
  const variant = resolveCartVariant(item);
  return getVariantDisplayPrice(variant, {
    price: item.product.price,
    originalPrice: item.product.originalPrice,
  }).price;
}

export function getCartItemThumb(item: CartItem): string {
  const variant = resolveCartVariant(item);
  const images = getVariantDisplayImages(variant, item.product);
  return images[0] ?? getProductPrimaryImage(item.product);
}

export function getCartItemLineLabel(item: CartItem): string {
  const variant = resolveCartVariant(item);
  return formatVariantLabel(variant);
}

export function emptyVariantForm() {
  return {
    color: "",
    size: "",
    scent: "",
    sku: "",
    barcode: "",
    price: 0,
    salePrice: undefined as number | undefined,
    stock: 0,
    imageIds: [] as string[],
    status: "available" as const,
  };
}

export function variantToFormData(variant: ProductVariant) {
  const normalized = normalizeVariant(variant);
  return {
    color: normalized.color,
    size: normalized.size,
    scent: normalized.scent ?? "",
    sku: normalized.sku,
    barcode: normalized.barcode,
    price: normalized.price,
    salePrice: normalized.salePrice,
    stock: normalized.stock,
    imageIds: [...(normalized.imageIds ?? [])],
    status: normalized.status,
  };
}

export function resolveVariantThumbnail(
  variant: ProductVariant,
  product: Pick<AdminProduct, "id" | "slug" | "name">,
  getMediaUrl: (id: string) => string
): string {
  const imageId = variant.imageIds?.[0];
  if (imageId) {
    return getMediaUrl(imageId);
  }

  if (variant.images?.[0]) {
    return variant.images[0];
  }

  return getSeedImagesForProduct(product)[0];
}

export function getProductTotalStock(
  variants?: ProductVariant[] | null
): number {
  const list = Array.isArray(variants) ? variants : [];
  return list.reduce(
    (sum, v) => sum + (typeof v.stock === "number" ? v.stock : 0),
    0
  );
}

export function getProductPrimarySku(
  variants?: ProductVariant[] | null
): string {
  const list = Array.isArray(variants) ? variants : [];
  return list[0]?.sku ?? "—";
}

export function getProductPriceRange(
  variants?: ProductVariant[] | null,
  fallback?: PriceFallback
): { min: number; max: number; hasRange: boolean } {
  const list = Array.isArray(variants) ? variants : [];

  if (!list.length) {
    const { price } = getVariantDisplayPrice(null, fallback);
    return { min: price, max: price, hasRange: false };
  }

  const prices = list.map(
    (v) => getVariantDisplayPrice(v, fallback).price
  );
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return { min, max, hasRange: min !== max };
}

export function resolveProductVariantForAdd(
  product: Product,
  variant?: ProductVariant | null
): ProductVariant {
  if (variant?.id) {
    return normalizeVariant(variant);
  }

  const variants = getProductVariantsSafe(product);

  if (hasProductVariants(product)) {
    const first =
      variants.find(isVariantInStock) ?? variants[0];
    if (first) return normalizeVariant(first);
  }

  return createSyntheticVariantFromProduct(product);
}

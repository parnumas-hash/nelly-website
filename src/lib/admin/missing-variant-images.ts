import { PLACEHOLDER_IMAGE } from "@/lib/image-utils";
import { collectUsedMediaIds } from "@/lib/media-library";
import { AdminProduct, MediaItem, ProductVariant } from "@/types";

export interface MissingVariantImageRow {
  productId: string;
  productName: string;
  brand: string;
  variantId: string;
  sku: string;
  color: string;
  size: string;
}

export function variantNeedsImage(variant: ProductVariant): boolean {
  if (variant.imageIds?.length) return false;

  const images = variant.images ?? [];
  if (images.length === 0) return true;

  return images.every(
    (image) =>
      image === PLACEHOLDER_IMAGE || image.includes("placeholder.svg")
  );
}

export function listVariantsMissingImages(
  products: AdminProduct[]
): MissingVariantImageRow[] {
  const rows: MissingVariantImageRow[] = [];

  for (const product of products) {
    for (const variant of product.variants ?? []) {
      if (!variantNeedsImage(variant)) continue;

      rows.push({
        productId: product.id,
        productName: product.name,
        brand: product.brand,
        variantId: variant.id,
        sku: variant.sku,
        color: variant.color,
        size: variant.size,
      });
    }
  }

  return rows.sort((a, b) => {
    const brand = a.brand.localeCompare(b.brand);
    if (brand !== 0) return brand;
    const name = a.productName.localeCompare(b.productName);
    if (name !== 0) return name;
    return a.sku.localeCompare(b.sku);
  });
}

export function countVariantsMissingImages(products: AdminProduct[]): number {
  return listVariantsMissingImages(products).length;
}

export function listUnusedMedia(
  media: MediaItem[],
  products: AdminProduct[],
  categories: Parameters<typeof collectUsedMediaIds>[1] = []
): MediaItem[] {
  const used = collectUsedMediaIds(products, categories);
  return media.filter((item) => !used.has(item.id));
}

export function suggestMediaForSku(
  sku: string,
  unusedMedia: MediaItem[]
): MediaItem[] {
  const normalized = sku.trim().toLowerCase();
  if (!normalized) return [];

  return unusedMedia.filter((item) => {
    const haystack = `${item.name} ${item.url}`.toLowerCase();
    return haystack.includes(normalized);
  });
}

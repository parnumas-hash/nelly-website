import { AdminProduct, BrandCategory, MediaItem, ProductVariant } from "@/types";
import {
  PLACEHOLDER_IMAGE,
  isValidImageUrl,
  sanitizeImageList,
} from "@/lib/image-utils";
import { compressDataUrl, JPEG_QUALITY, MAX_WIDTH } from "@/lib/media-compress";

function newMediaId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function resolveMediaUrl(
  id: string,
  media: MediaItem[]
): string | null {
  return media.find((item) => item.id === id)?.url ?? null;
}

export function resolveImageIds(
  imageIds: string[] | undefined,
  media: MediaItem[],
  fallback: string[] = [PLACEHOLDER_IMAGE]
): string[] {
  if (!imageIds?.length) return [...fallback];

  const urls = imageIds
    .map((id) => resolveMediaUrl(id, media))
    .filter((url): url is string => !!url);

  return sanitizeImageList(urls, fallback);
}

export function isExternalImageUrl(url: string): boolean {
  return (
    isValidImageUrl(url) &&
    !url.startsWith("data:") &&
    (url.startsWith("http://") ||
      url.startsWith("https://") ||
      url.startsWith("/"))
  );
}

export function resolveVariantImagesForDisplay(
  variant: Pick<ProductVariant, "imageIds" | "images">,
  media: MediaItem[],
  fallback: string[]
): string[] {
  const fromIds = resolveImageIds(variant.imageIds, media, []);
  if (fromIds.length > 0 && fromIds[0] !== PLACEHOLDER_IMAGE) {
    return sanitizeImageList(fromIds, fallback);
  }

  const external = (variant.images ?? []).filter(isExternalImageUrl);
  return sanitizeImageList(external, fallback);
}

export function stripVariantForStorage(variant: ProductVariant): ProductVariant {
  return {
    ...variant,
    imageIds: Array.isArray(variant.imageIds)
      ? variant.imageIds.filter(Boolean)
      : [],
    images: (variant.images ?? []).filter(isExternalImageUrl),
  };
}

export function stripProductsForStorage(products: AdminProduct[]): AdminProduct[] {
  return products.map((product) => ({
    ...product,
    petType:
      product.petType === "dog" || product.petType === "cat"
        ? product.petType
        : null,
    variants: (product.variants ?? []).map(stripVariantForStorage),
  }));
}

export function enrichProductWithMedia(
  product: AdminProduct,
  media: MediaItem[],
  fallback: string[]
): AdminProduct {
  return {
    ...product,
    variants: (product.variants ?? []).map((variant) => {
      const stored = stripVariantForStorage(variant);
      return {
        ...stored,
        images: resolveVariantImagesForDisplay(stored, media, fallback),
      };
    }),
  };
}

function createMediaFromDataUrl(
  dataUrl: string,
  media: MediaItem[],
  index: number
): { item: MediaItem; media: MediaItem[] } {
  const existing = media.find((item) => item.url === dataUrl);
  if (existing) {
    return { item: existing, media };
  }

  const item: MediaItem = {
    id: newMediaId(),
    name: `migrated-image-${index + 1}.jpg`,
    url: dataUrl,
    type: "image",
    createdAt: new Date().toISOString(),
  };

  return { item, media: [item, ...media] };
}

export function migrateVariantToMediaRefs(
  variant: ProductVariant,
  media: MediaItem[],
  index: number
): { variant: ProductVariant; media: MediaItem[]; changed: boolean } {
  let nextMedia = media;
  let changed = false;
  const imageIds = [...(variant.imageIds ?? [])];
  const externalImages = (variant.images ?? []).filter(isExternalImageUrl);

  for (const url of variant.images ?? []) {
    if (!url.startsWith("data:")) continue;

    const { item, media: updatedMedia } = createMediaFromDataUrl(
      url,
      nextMedia,
      index
    );
    nextMedia = updatedMedia;

    if (!imageIds.includes(item.id)) {
      imageIds.push(item.id);
    }
    changed = true;
  }

  if (changed || imageIds.length !== (variant.imageIds ?? []).length) {
    changed = true;
  }

  return {
    variant: {
      ...variant,
      imageIds,
      images: externalImages,
    },
    media: nextMedia,
    changed,
  };
}

export function migrateCatalogToMediaRefs(
  products: AdminProduct[],
  media: MediaItem[]
): { products: AdminProduct[]; media: MediaItem[]; changed: boolean } {
  let nextMedia = media;
  let changed = false;

  const nextProducts = products.map((product) => {
    let nextVariants = product.variants ?? [];

    nextVariants = nextVariants.map((variant, index) => {
      const result = migrateVariantToMediaRefs(variant, nextMedia, index);
      nextMedia = result.media;
      if (result.changed) changed = true;
      return result.variant;
    });

    return { ...product, variants: nextVariants };
  });

  return { products: nextProducts, media: nextMedia, changed };
}

export function isMediaLibraryId(ref: string | undefined): ref is string {
  if (!ref) return false;
  if (ref.startsWith("data:")) return false;
  if (ref.startsWith("http://") || ref.startsWith("https://")) return false;
  if (ref.startsWith("/")) return false;
  return true;
}

export function collectUsedMediaIds(
  products: AdminProduct[],
  categories: BrandCategory[] = []
): Set<string> {
  const used = new Set<string>();

  for (const product of products) {
    for (const variant of product.variants ?? []) {
      for (const id of variant.imageIds ?? []) {
        if (id) used.add(id);
      }
    }
  }

  for (const category of categories) {
    if (isMediaLibraryId(category.imageId)) {
      used.add(category.imageId);
    }
  }

  return used;
}

export function removeUnusedMedia(
  media: MediaItem[],
  products: AdminProduct[],
  categories: BrandCategory[] = []
): { media: MediaItem[]; removedCount: number } {
  const used = collectUsedMediaIds(products, categories);
  const next = media.filter((item) => used.has(item.id));
  return { media: next, removedCount: media.length - next.length };
}

export function countUnusedMedia(
  media: MediaItem[],
  products: AdminProduct[],
  categories: BrandCategory[] = []
): number {
  return removeUnusedMedia(media, products, categories).removedCount;
}

export async function recompressMediaLibrary(
  media: MediaItem[]
): Promise<MediaItem[]> {
  const next: MediaItem[] = [];

  for (const item of media) {
    if (!item.url.startsWith("data:")) {
      next.push(item);
      continue;
    }
    try {
      next.push({
        ...item,
        url: await compressDataUrl(item.url, MAX_WIDTH, JPEG_QUALITY),
      });
    } catch {
      next.push(item);
    }
  }

  return next;
}

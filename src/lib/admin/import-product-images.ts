import { PLACEHOLDER_IMAGE } from "@/lib/image-utils";
import { MediaItem } from "@/types";
import { ProductImportGroup } from "@/lib/admin/product-import";

function isImportableUrl(url: string): boolean {
  if (!url || url === PLACEHOLDER_IMAGE) return false;
  return (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("data:")
  );
}

export function collectImportImageUrls(groups: ProductImportGroup[]): string[] {
  const urls = new Set<string>();

  for (const group of groups) {
    for (const variant of group.variants) {
      for (const url of variant.images ?? []) {
        if (isImportableUrl(url)) urls.add(url);
      }
    }
  }

  return [...urls];
}

export function buildUrlToMediaIdMap(
  media: MediaItem[],
  imported: MediaItem[] = []
): Map<string, string> {
  const map = new Map<string, string>();

  for (const item of [...imported, ...media]) {
    if (item.url) map.set(item.url, item.id);
  }

  return map;
}

export function attachMediaIdsToImportGroups(
  groups: ProductImportGroup[],
  urlToId: Map<string, string>
): ProductImportGroup[] {
  return groups.map((group) => ({
    ...group,
    variants: group.variants.map((variant) => {
      const imageIds = [...(variant.imageIds ?? [])];

      for (const url of variant.images ?? []) {
        const id = urlToId.get(url);
        if (id && !imageIds.includes(id)) {
          imageIds.push(id);
        }
      }

      return {
        ...variant,
        imageIds,
        images: (variant.images ?? []).filter((url) => !urlToId.has(url)),
      };
    }),
  }));
}

export function filterUrlsNeedingImport(
  urls: string[],
  media: MediaItem[]
): string[] {
  const known = new Set(media.map((item) => item.url));
  return urls.filter((url) => !known.has(url));
}

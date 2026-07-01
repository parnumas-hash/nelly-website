import { generateId } from "@/lib/admin/storage";
import { PLACEHOLDER_IMAGE } from "@/lib/image-utils";
import { isSupabaseConfigured } from "@/lib/supabase/admin";
import { importRemoteImageToStorage } from "@/lib/supabase/media-storage";
import { MediaItem } from "@/types";

function isImportableUrl(url: string): boolean {
  if (!url || url === PLACEHOLDER_IMAGE) return false;
  return (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("data:")
  );
}

function fileNameFromUrl(url: string, index: number): string {
  try {
    const pathname = new URL(url).pathname;
    const base = pathname.split("/").pop()?.trim();
    if (base) return base;
  } catch {
    // Ignore malformed URLs and use fallback below.
  }
  return `imported-image-${index + 1}.jpg`;
}

export interface ImportedRemoteImageResult {
  url: string;
  item?: MediaItem;
  error?: string;
}

export async function importRemoteImageAsMediaItem(
  url: string,
  index: number
): Promise<MediaItem> {
  const name = fileNameFromUrl(url, index);
  const id = generateId();
  const storagePath = `import/${id}-${name.replace(/[^\w.-]+/g, "-")}`;

  const publicUrl = isSupabaseConfigured()
    ? await importRemoteImageToStorage(url, storagePath)
    : url;

  return {
    id,
    name,
    url: publicUrl,
    type: "image",
    createdAt: new Date().toISOString(),
  };
}

export async function importRemoteImagesAsMediaItems(
  urls: string[]
): Promise<ImportedRemoteImageResult[]> {
  const unique = [...new Set(urls.filter(isImportableUrl))];
  const results: ImportedRemoteImageResult[] = [];

  for (let index = 0; index < unique.length; index += 1) {
    const url = unique[index];
    try {
      const item = await importRemoteImageAsMediaItem(url, index);
      results.push({ url, item });
    } catch (error) {
      results.push({
        url,
        error: error instanceof Error ? error.message : "Import failed.",
      });
    }
  }

  return results;
}

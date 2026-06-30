import {
  compressImageFile,
  SITE_CONTENT_MAX_BYTES,
  SITE_CONTENT_MAX_WIDTH,
  SITE_CONTENT_PRESERVE_ORIGINAL_MAX_BYTES,
} from "./media-compress";

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/** Read and compress an uploaded brand/catalog image (auto-fits under 5 MB). */
export async function readBrandImageFile(file: File): Promise<string> {
  return compressImageFile(file);
}

/** Smaller output for homepage/site content to avoid browser storage limits. */
export async function readSiteContentImageFile(file: File): Promise<string> {
  return compressImageFile(file, {
    maxBytes: SITE_CONTENT_MAX_BYTES,
    maxWidth: SITE_CONTENT_MAX_WIDTH,
    preserveOriginalMaxBytes: SITE_CONTENT_PRESERVE_ORIGINAL_MAX_BYTES,
  });
}

export { SITE_CONTENT_MAX_BYTES };

import { compressImageFile, SITE_CONTENT_MAX_BYTES, SITE_CONTENT_MAX_WIDTH, SITE_CONTENT_PRESERVE_ORIGINAL_MAX_BYTES } from "@/lib/media-compress";

/** Read and compress an uploaded banner/site image for browser storage limits. */
export async function readBannerImageFile(file: File): Promise<string> {
  return compressImageFile(file, {
    maxBytes: SITE_CONTENT_MAX_BYTES,
    maxWidth: SITE_CONTENT_MAX_WIDTH,
    preserveOriginalMaxBytes: SITE_CONTENT_PRESERVE_ORIGINAL_MAX_BYTES,
  });
}

export const BANNER_MAX_BYTES = SITE_CONTENT_MAX_BYTES;
export const BANNER_MAX_WIDTH = SITE_CONTENT_MAX_WIDTH;
export const BANNER_JPEG_QUALITY = 0.92;

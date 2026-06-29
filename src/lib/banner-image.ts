import { fileToBase64 } from "@/lib/brand-image";
import { compressDataUrl } from "@/lib/media-compress";

export const BANNER_MAX_BYTES = 5 * 1024 * 1024;
export const BANNER_MAX_WIDTH = 1920;
export const BANNER_JPEG_QUALITY = 0.92;

/** Preserve original quality for typical banner files; re-encode only when very large. */
export async function readBannerImageFile(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please upload an image file.");
  }
  if (file.size > BANNER_MAX_BYTES) {
    throw new Error("Image must be under 5 MB.");
  }

  const dataUrl = await fileToBase64(file);

  if (file.size <= 1.5 * 1024 * 1024) {
    return dataUrl;
  }

  return compressDataUrl(dataUrl, BANNER_MAX_WIDTH, BANNER_JPEG_QUALITY);
}

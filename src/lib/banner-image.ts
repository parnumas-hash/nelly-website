import { compressImageFile } from "@/lib/media-compress";

export const BANNER_MAX_BYTES = 5 * 1024 * 1024;
export const BANNER_MAX_WIDTH = 1920;
export const BANNER_JPEG_QUALITY = 0.92;

/** Read and compress an uploaded banner image (auto-fits under 5 MB). */
export async function readBannerImageFile(file: File): Promise<string> {
  return compressImageFile(file);
}

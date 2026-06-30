import { compressImageFile } from "./media-compress";

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/** Read and compress an uploaded brand/site image (auto-fits under 5 MB). */
export async function readBrandImageFile(file: File): Promise<string> {
  return compressImageFile(file);
}

import type { Area } from "react-easy-crop";

const MAX_OUTPUT_PX = 1200;

/** Fixed 1:1 square crop for brand logos */
export const BRAND_CROP_ASPECT = 1;

/** Category image crop options */
export const CATEGORY_CROP_ASPECTS = {
  square: 1,
  landscape: 4 / 3,
} as const;

export type CategoryCropMode = keyof typeof CATEGORY_CROP_ASPECTS;

export function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", reject);
    image.src = url;
  });
}

export async function getCroppedImageBase64(
  imageSrc: string,
  pixelCrop: Area,
  mimeType: string = "image/jpeg"
): Promise<string> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Could not create canvas context.");
  }

  const scale = Math.min(1, MAX_OUTPUT_PX / Math.max(pixelCrop.width, pixelCrop.height));
  canvas.width = Math.max(1, Math.floor(pixelCrop.width * scale));
  canvas.height = Math.max(1, Math.floor(pixelCrop.height * scale));

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    canvas.width,
    canvas.height
  );

  const outputType = mimeType === "image/png" ? "image/png" : "image/jpeg";
  const quality = outputType === "image/jpeg" ? 0.92 : undefined;
  return canvas.toDataURL(outputType, quality);
}

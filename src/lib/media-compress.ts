import { fileToBase64 } from "./brand-image";

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
export const MAX_WIDTH = 1920;
export const JPEG_QUALITY = 0.92;
export const PRESERVE_ORIGINAL_MAX_BYTES = 1.5 * 1024 * 1024;

const MIN_QUALITY = 0.35;
const MIN_DIMENSION = 480;

/** Approximate decoded byte size of a base64 data URL. */
export function estimateDataUrlBytes(dataUrl: string): number {
  const commaIndex = dataUrl.indexOf(",");
  const base64 = commaIndex >= 0 ? dataUrl.slice(commaIndex + 1) : dataUrl;
  const padding = base64.match(/=+$/)?.[0]?.length ?? 0;
  return Math.floor((base64.length * 3) / 4) - padding;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function renderToDataUrl(
  image: HTMLImageElement,
  width: number,
  height: number,
  mimeType: "image/jpeg" | "image/png",
  quality?: number
): string {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not process image.");
  }

  ctx.drawImage(image, 0, 0, width, height);
  return canvas.toDataURL(mimeType, quality);
}

/** Iteratively resize/re-encode until the data URL fits under maxBytes. */
export async function fitImageToMaxBytes(
  image: HTMLImageElement,
  width: number,
  height: number,
  maxBytes: number = MAX_UPLOAD_BYTES,
  preferPng = false
): Promise<string> {
  let quality = JPEG_QUALITY;
  let w = width;
  let h = height;
  let usePng = preferPng;

  while (true) {
    const mimeType = usePng ? "image/png" : "image/jpeg";
    const result = renderToDataUrl(
      image,
      w,
      h,
      mimeType,
      mimeType === "image/jpeg" ? quality : undefined
    );

    if (estimateDataUrlBytes(result) <= maxBytes) {
      return result;
    }

    if (usePng) {
      usePng = false;
      quality = JPEG_QUALITY;
      continue;
    }

    if (quality > MIN_QUALITY + 0.08) {
      quality = Math.max(MIN_QUALITY, quality - 0.08);
      continue;
    }

    if (Math.max(w, h) > MIN_DIMENSION) {
      w = Math.max(1, Math.round(w * 0.85));
      h = Math.max(1, Math.round(h * 0.85));
      quality = JPEG_QUALITY;
      continue;
    }

    if (quality > MIN_QUALITY) {
      quality = Math.max(MIN_QUALITY, quality - 0.05);
      continue;
    }

    throw new Error("Could not compress image below 5 MB. Try a smaller image.");
  }
}

export async function ensureDataUrlMaxBytes(
  dataUrl: string,
  maxBytes: number = MAX_UPLOAD_BYTES,
  maxWidth: number = MAX_WIDTH
): Promise<string> {
  if (estimateDataUrlBytes(dataUrl) <= maxBytes) {
    return dataUrl;
  }

  const image = await loadImage(dataUrl);
  const scale = Math.min(1, maxWidth / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));
  const preferPng = dataUrl.startsWith("data:image/png");

  return fitImageToMaxBytes(image, width, height, maxBytes, preferPng);
}

export async function compressImageFile(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please upload an image file.");
  }

  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await loadImage(objectUrl);
    const largestSide = Math.max(image.width, image.height);
    const needsResize = largestSide > MAX_WIDTH;
    const needsCompress = file.size > PRESERVE_ORIGINAL_MAX_BYTES;

    if (!needsResize && !needsCompress && file.size <= MAX_UPLOAD_BYTES) {
      return fileToBase64(file);
    }

    const scale = Math.min(1, MAX_WIDTH / largestSide);
    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));
    const preferPng = file.type === "image/png" && file.size <= MAX_UPLOAD_BYTES;

    return fitImageToMaxBytes(image, width, height, MAX_UPLOAD_BYTES, preferPng);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export async function compressDataUrl(
  dataUrl: string,
  maxWidth: number = MAX_WIDTH,
  quality: number = JPEG_QUALITY
): Promise<string> {
  const image = await loadImage(dataUrl);
  const scale = Math.min(1, maxWidth / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));
  const preferPng = dataUrl.startsWith("data:image/png");

  const rendered = renderToDataUrl(
    image,
    width,
    height,
    preferPng ? "image/png" : "image/jpeg",
    preferPng ? undefined : quality
  );

  return ensureDataUrlMaxBytes(rendered, MAX_UPLOAD_BYTES, maxWidth);
}

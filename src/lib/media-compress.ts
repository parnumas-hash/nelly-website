import { fileToBase64 } from "./brand-image";

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const MAX_WIDTH = 1920;
const JPEG_QUALITY = 0.92;
const PRESERVE_ORIGINAL_MAX_BYTES = 1.5 * 1024 * 1024;

export {
  MAX_UPLOAD_BYTES,
  MAX_WIDTH,
  JPEG_QUALITY,
  PRESERVE_ORIGINAL_MAX_BYTES,
};

export async function compressImageFile(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please upload an image file.");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("Image must be under 5 MB.");
  }

  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await loadImage(objectUrl);
    const largestSide = Math.max(image.width, image.height);
    const needsResize = largestSide > MAX_WIDTH;
    const needsCompress = file.size > PRESERVE_ORIGINAL_MAX_BYTES;

    if (!needsResize && !needsCompress) {
      return fileToBase64(file);
    }

    const scale = Math.min(1, MAX_WIDTH / largestSide);
    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Could not process image.");
    }

    ctx.drawImage(image, 0, 0, width, height);
    return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
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

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not process image.");
  }

  ctx.drawImage(image, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", quality);
}

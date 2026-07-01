import { createAdminClient } from "@/lib/supabase/admin";

const BUCKET = "catalog-media";

function parseDataUrl(dataUrl: string): {
  buffer: Buffer;
  contentType: string;
  ext: string;
} {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) {
    throw new Error("Invalid data URL.");
  }

  const contentType = match[1];
  const ext =
    contentType === "image/png"
      ? "png"
      : contentType === "image/webp"
        ? "webp"
        : contentType === "image/gif"
          ? "gif"
          : "jpg";

  return {
    contentType,
    ext,
    buffer: Buffer.from(match[2], "base64"),
  };
}

function isDataUrl(url: string): boolean {
  return url.startsWith("data:");
}

function isStoredMediaUrl(url: string): boolean {
  return url.includes("/storage/v1/object/public/catalog-media/");
}

export async function uploadDataUrl(
  dataUrl: string,
  path: string
): Promise<string> {
  const supabase = createAdminClient();
  const { buffer, contentType } = parseDataUrl(dataUrl);

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType, upsert: true });

  if (error) {
    throw new Error(`Media upload failed: ${error.message}`);
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function ensurePublicUrl(
  url: string,
  storagePath: string
): Promise<string> {
  if (!url || !isDataUrl(url)) return url;
  if (isStoredMediaUrl(url)) return url;
  return uploadDataUrl(url, storagePath);
}

function sanitizeRemoteUrl(url: string): URL {
  const parsed = new URL(url);
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Only http(s) image URLs are supported.");
  }
  return parsed;
}

export async function uploadRemoteImage(
  remoteUrl: string,
  storagePath: string
): Promise<string> {
  sanitizeRemoteUrl(remoteUrl);

  const response = await fetch(remoteUrl, { redirect: "follow" });
  if (!response.ok) {
    throw new Error(`Failed to fetch image (${response.status}).`);
  }

  const contentType = response.headers.get("content-type") ?? "image/jpeg";
  if (!contentType.startsWith("image/")) {
    throw new Error("URL did not return an image.");
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const supabase = createAdminClient();

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, buffer, { contentType, upsert: true });

  if (error) {
    throw new Error(`Media upload failed: ${error.message}`);
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}

export async function importRemoteImageToStorage(
  remoteUrl: string,
  storagePath: string
): Promise<string> {
  if (isStoredMediaUrl(remoteUrl)) return remoteUrl;
  if (isDataUrl(remoteUrl)) return ensurePublicUrl(remoteUrl, storagePath);
  return uploadRemoteImage(remoteUrl, storagePath);
}

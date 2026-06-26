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

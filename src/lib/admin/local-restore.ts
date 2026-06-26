import { parseCatalogBackup } from "@/lib/admin/backup";
import { isRemoteCatalogEnabled } from "@/lib/admin/catalog-sync";

export async function fetchStagedLocalRestoreRaw(): Promise<string | null> {
  if (process.env.NODE_ENV === "production") return null;
  if (isRemoteCatalogEnabled()) return null;

  try {
    const response = await fetch("/api/dev/stage-local-restore", {
      cache: "no-store",
    });
    if (!response.ok) return null;
    return await response.text();
  } catch {
    return null;
  }
}

export async function fetchStagedLocalRestore() {
  const raw = await fetchStagedLocalRestoreRaw();
  if (!raw) return null;
  return parseCatalogBackup(raw);
}

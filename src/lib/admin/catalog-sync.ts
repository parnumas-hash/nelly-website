import {
  AdminBrand,
  AdminProduct,
  BrandCategory,
  HeroBanner,
  MediaItem,
} from "@/types";

export interface CatalogSyncSnapshot {
  catalogVersion?: number;
  products: AdminProduct[];
  brands: AdminBrand[];
  categories: BrandCategory[];
  media: MediaItem[];
  banner: HeroBanner;
}

export function isRemoteCatalogEnabled(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
}

let syncTimer: ReturnType<typeof setTimeout> | null = null;
let syncInFlight = false;
let pendingSnapshot: CatalogSyncSnapshot | null = null;

export interface CatalogSyncHandlers {
  onError?: (message: string) => void;
  onSuccess?: () => void;
}

let syncHandlers: CatalogSyncHandlers = {};

export function setCatalogSyncHandlers(handlers: CatalogSyncHandlers): void {
  syncHandlers = handlers;
}

async function pushSnapshot(snapshot: CatalogSyncSnapshot): Promise<void> {
  const response = await fetch("/api/catalog", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(snapshot),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(body?.error ?? "Could not save catalog to server.");
  }
}

async function flushQueue(): Promise<void> {
  if (syncInFlight || !pendingSnapshot) return;

  syncInFlight = true;
  const snapshot = pendingSnapshot;
  pendingSnapshot = null;

  try {
    await pushSnapshot(snapshot);
    syncHandlers.onSuccess?.();
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Could not save catalog to cloud.";
    syncHandlers.onError?.(message);
  } finally {
    syncInFlight = false;
    if (pendingSnapshot) {
      void flushQueue();
    }
  }
}

export function scheduleRemoteCatalogSync(snapshot: CatalogSyncSnapshot): void {
  if (!isRemoteCatalogEnabled()) return;
  pendingSnapshot = snapshot;
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    syncTimer = null;
    void flushQueue();
  }, 500);
}

export async function fetchRemoteCatalog(): Promise<CatalogSyncSnapshot | null> {
  if (!isRemoteCatalogEnabled()) return null;

  const response = await fetch("/api/catalog", { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Could not load catalog from server.");
  }

  const data = (await response.json()) as CatalogSyncSnapshot & {
    empty?: boolean;
  };

  if (data.empty) return null;
  if (!Array.isArray(data.products) || !Array.isArray(data.brands)) {
    throw new Error("Invalid catalog response from server.");
  }

  return data;
}

export async function restoreRemoteCatalog(
  backupJson: string
): Promise<CatalogSyncSnapshot> {
  const response = await fetch("/api/catalog/restore", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: backupJson,
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(body?.error ?? "Could not restore backup to server.");
  }

  return (await response.json()) as CatalogSyncSnapshot;
}

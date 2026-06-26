import {
  AdminBrand,
  AdminProduct,
  BrandCategory,
  HeroBanner,
  MediaItem,
} from "@/types";
import { isSupabaseConfigured } from "@/lib/supabase/admin";

export interface CatalogSyncSnapshot {
  catalogVersion?: number;
  products: AdminProduct[];
  brands: AdminBrand[];
  categories: BrandCategory[];
  media: MediaItem[];
  banner: HeroBanner;
}

export function isRemoteCatalogEnabled(): boolean {
  return isSupabaseConfigured();
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

function parseCatalogResponse(
  data: CatalogSyncSnapshot & { empty?: boolean }
): CatalogSyncSnapshot | null {
  if (data.empty) return null;
  if (!Array.isArray(data.products) || !Array.isArray(data.brands)) {
    throw new Error("Invalid catalog response from server.");
  }
  return data;
}

/** Storefront — published products only. */
export async function fetchRemoteCatalog(): Promise<CatalogSyncSnapshot | null> {
  if (!isRemoteCatalogEnabled()) return null;

  const response = await fetch("/api/catalog", { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Could not load catalog from server.");
  }

  const data = (await response.json()) as CatalogSyncSnapshot & {
    empty?: boolean;
  };
  return parseCatalogResponse(data);
}

/** Admin — full catalog including drafts; requires admin session cookie. */
export async function fetchRemoteCatalogAdmin(): Promise<CatalogSyncSnapshot | null> {
  if (!isRemoteCatalogEnabled()) return null;

  const response = await fetch("/api/catalog/admin", { cache: "no-store" });
  if (response.status === 401) {
    throw new Error("Admin session expired. Please sign in again.");
  }
  if (!response.ok) {
    throw new Error("Could not load admin catalog from server.");
  }

  const data = (await response.json()) as CatalogSyncSnapshot & {
    empty?: boolean;
  };
  return parseCatalogResponse(data);
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

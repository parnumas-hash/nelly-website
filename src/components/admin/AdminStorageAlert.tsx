"use client";

import Link from "next/link";
import { useCatalog } from "@/context/CatalogContext";
import { isRemoteCatalogEnabled } from "@/lib/admin/catalog-sync";

export default function AdminStorageAlert() {
  const {
    storageError,
    clearStorageError,
    purgeUnusedMedia,
    unusedMediaCount,
  } = useCatalog();

  if (!storageError && unusedMediaCount === 0) return null;

  return (
    <div
      role="alert"
      className="mb-6 flex flex-wrap items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200"
    >
      <div className="space-y-1">
        {storageError ? <p>{storageError}</p> : null}
        {unusedMediaCount > 0 ? (
          <p className="text-red-700/90 dark:text-red-200/90">
            {unusedMediaCount} unused image
            {unusedMediaCount === 1 ? "" : "s"} in the media library.
          </p>
        ) : null}
        {!isRemoteCatalogEnabled() ? (
          <p className="text-xs text-red-700/80 dark:text-red-200/80">
            Browser storage is limited (~5 MB). Export a backup in{" "}
            <Link href="/admin/settings" className="font-medium underline">
              Settings
            </Link>
            , remove unused images in{" "}
            <Link href="/admin/media" className="font-medium underline">
              Media
            </Link>
            .
          </p>
        ) : null}
      </div>
      <div className="flex shrink-0 flex-wrap gap-2">
        {unusedMediaCount > 0 && (
          <button
            type="button"
            onClick={() => purgeUnusedMedia()}
            className="rounded-full bg-red-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-900 dark:bg-red-700"
          >
            Remove unused ({unusedMediaCount})
          </button>
        )}
        {storageError && (
          <button
            type="button"
            onClick={clearStorageError}
            className="text-xs font-medium uppercase tracking-wider underline underline-offset-2"
          >
            Dismiss
          </button>
        )}
      </div>
    </div>
  );
}

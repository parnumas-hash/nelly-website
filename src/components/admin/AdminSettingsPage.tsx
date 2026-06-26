"use client";

import { useRef, useState } from "react";
import {
  Download,
  RotateCcw,
  Upload,
  AlertTriangle,
  Shield,
} from "lucide-react";
import Button from "@/components/ui/Button";
import { useCatalog } from "@/context/CatalogContext";

export default function AdminSettingsPage() {
  const {
    exportCatalogBackup,
    restoreCatalogBackup,
    resetAdminStorage,
    adminProducts,
    brands,
    categories,
    media,
    ready,
  } = useCatalog();

  const fileRef = useRef<HTMLInputElement>(null);
  const [restoreError, setRestoreError] = useState("");
  const [restoreSuccess, setRestoreSuccess] = useState("");
  const [resetConfirm, setResetConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  if (!ready) {
    return <div className="py-20 text-center text-neutral-400">Loading...</div>;
  }

  const handleRestoreFile = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;

    setRestoreError("");
    setRestoreSuccess("");

    let summaryText = "";
    try {
      const text = await file.text();
      const preview = JSON.parse(text);
      if (preview.exportedAt) {
        summaryText = `\n\nBackup date: ${new Date(preview.exportedAt).toLocaleString()}\nProducts: ${preview.products?.length ?? "?"}\nMedia files: ${preview.media?.length ?? "?"}`;
      }
    } catch {
      setRestoreError("Could not read backup file.");
      if (fileRef.current) fileRef.current.value = "";
      return;
    }

    if (
      !window.confirm(
        `Restore this backup? All current admin data will be replaced.${summaryText}\n\nThis cannot be undone unless you exported a backup first.`
      )
    ) {
      if (fileRef.current) fileRef.current.value = "";
      return;
    }

    setBusy(true);
    try {
      const summary = await restoreCatalogBackup(file);
      setRestoreSuccess(
        `Restored ${summary.productCount} products, ${summary.brandCount} brands, ${summary.mediaCount} media files.`
      );
    } catch (error) {
      setRestoreError(
        error instanceof Error ? error.message : "Could not restore backup."
      );
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleReset = () => {
    if (resetConfirm.trim().toUpperCase() !== "RESET") {
      setRestoreError('Type RESET in the box below to confirm factory reset.');
      return;
    }

    if (
      !window.confirm(
        "Last chance: reset everything to demo defaults? Export a backup first if you need your data."
      )
    ) {
      return;
    }

    resetAdminStorage();
    setResetConfirm("");
    setRestoreSuccess("Storage reset to demo defaults.");
    setRestoreError("");
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Settings
        </h1>
        <p className="mt-2 text-neutral-500">
          Export a backup before major changes. Restore replaces all admin data
          in this browser.
        </p>
      </div>

      {(restoreSuccess || restoreError) && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            restoreError
              ? "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
              : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
          }`}
        >
          {restoreError || restoreSuccess}
        </div>
      )}

      <section className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mb-4 flex items-start gap-3">
          <Shield className="mt-0.5 h-5 w-5 text-primary" />
          <div>
            <h2 className="text-lg font-semibold">Backup & Restore</h2>
            <p className="mt-1 text-sm text-neutral-500">
              Saves products, brands, categories, media library, and banner as
              one JSON file.
            </p>
          </div>
        </div>

        <dl className="mb-6 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <div className="rounded-xl bg-neutral-50 px-3 py-2 dark:bg-neutral-950">
            <dt className="text-neutral-500">Products</dt>
            <dd className="font-semibold">{adminProducts.length}</dd>
          </div>
          <div className="rounded-xl bg-neutral-50 px-3 py-2 dark:bg-neutral-950">
            <dt className="text-neutral-500">Brands</dt>
            <dd className="font-semibold">{brands.length}</dd>
          </div>
          <div className="rounded-xl bg-neutral-50 px-3 py-2 dark:bg-neutral-950">
            <dt className="text-neutral-500">Categories</dt>
            <dd className="font-semibold">{categories.length}</dd>
          </div>
          <div className="rounded-xl bg-neutral-50 px-3 py-2 dark:bg-neutral-950">
            <dt className="text-neutral-500">Media</dt>
            <dd className="font-semibold">{media.length}</dd>
          </div>
        </dl>

        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            className="gap-2"
            onClick={() => exportCatalogBackup()}
          >
            <Download className="h-4 w-4" />
            Export Backup
          </Button>
          <Button
            type="button"
            variant="outline"
            className="gap-2"
            disabled={busy}
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="h-4 w-4" />
            Restore Backup
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => void handleRestoreFile(e.target.files)}
          />
        </div>

        <p className="mt-4 text-xs text-neutral-500">
          Tip: export regularly — data lives in this browser only until you move
          to a server database.
        </p>
      </section>

      <section className="rounded-2xl border border-red-200 bg-red-50/50 p-6 dark:border-red-900/50 dark:bg-red-950/20">
        <div className="mb-4 flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 text-red-600" />
          <div>
            <h2 className="text-lg font-semibold text-red-700 dark:text-red-300">
              Factory Reset
            </h2>
            <p className="mt-1 text-sm text-red-600/80 dark:text-red-300/80">
              Clears all admin data and reloads demo products, brands, and an
              empty media library. Export a backup first.
            </p>
          </div>
        </div>

        <label className="mb-3 block text-sm font-medium text-red-700 dark:text-red-300">
          Type RESET to confirm
        </label>
        <input
          value={resetConfirm}
          onChange={(e) => setResetConfirm(e.target.value)}
          placeholder="RESET"
          className="mb-4 w-full max-w-xs rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm dark:border-red-900 dark:bg-neutral-950"
        />

        <Button
          type="button"
          variant="outline"
          className="gap-2 border-red-300 text-red-700 hover:bg-red-100 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950/40"
          onClick={handleReset}
        >
          <RotateCcw className="h-4 w-4" />
          Reset to Demo Defaults
        </Button>
      </section>
    </div>
  );
}

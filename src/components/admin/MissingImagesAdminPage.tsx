"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, ImageIcon, Sparkles, Wand2 } from "lucide-react";
import Button from "@/components/ui/Button";
import { useCatalog } from "@/context/CatalogContext";
import { useAdminSession } from "@/context/AdminSessionContext";
import {
  listUnusedMedia,
  listVariantsMissingImages,
  suggestMediaForSku,
} from "@/lib/admin/missing-variant-images";
import { cn } from "@/lib/utils";
import { shouldUnoptimize } from "@/lib/image-utils";

type PendingSelection = Record<string, string>;

export default function MissingImagesAdminPage() {
  const { adminProducts, categories, media, getMediaUrl, batchAttachVariantImages, ready } =
    useCatalog();
  const { hasPermission } = useAdminSession();
  const canWrite = hasPermission("products:write");

  const missingRows = useMemo(
    () => listVariantsMissingImages(adminProducts),
    [adminProducts]
  );
  const unusedMedia = useMemo(
    () => listUnusedMedia(media, adminProducts, categories),
    [adminProducts, categories, media]
  );

  const [selection, setSelection] = useState<PendingSelection>({});
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const selectedCount = Object.values(selection).filter(Boolean).length;

  const handleAutoMatch = () => {
    const next: PendingSelection = { ...selection };

    for (const row of missingRows) {
      const suggestions = suggestMediaForSku(row.sku, unusedMedia);
      if (suggestions.length === 1) {
        next[row.variantId] = suggestions[0].id;
      }
    }

    setSelection(next);
    setMessage("Auto-matched variants with a single unused image matching SKU.");
  };

  const handleApply = () => {
    if (!canWrite) return;

    const updates = missingRows
      .map((row) => ({
        productId: row.productId,
        variantId: row.variantId,
        imageIds: selection[row.variantId] ? [selection[row.variantId]] : [],
      }))
      .filter((row) => row.imageIds.length > 0);

    if (updates.length === 0) {
      setMessage("Select at least one image before applying.");
      return;
    }

    setBusy(true);
    try {
      const count = batchAttachVariantImages(updates);
      setSelection({});
      setMessage(`Attached images to ${count} variant(s).`);
    } finally {
      setBusy(false);
    }
  };

  if (!ready) {
    return <div className="py-20 text-center text-neutral-400">Loading...</div>;
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href="/admin/products"
            className="mb-3 inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Products
          </Link>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Missing Product Images
          </h1>
          <p className="mt-1 text-neutral-500">
            {missingRows.length} variant(s) without media library images
            {unusedMedia.length > 0 ? ` · ${unusedMedia.length} unused in library` : ""}
          </p>
        </div>
        {canWrite ? (
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              className="gap-2"
              onClick={handleAutoMatch}
              disabled={busy || missingRows.length === 0}
            >
              <Wand2 className="h-4 w-4" />
              Auto-match by SKU
            </Button>
            <Button
              type="button"
              className="gap-2"
              onClick={handleApply}
              disabled={busy || selectedCount === 0}
            >
              <Sparkles className="h-4 w-4" />
              Apply {selectedCount > 0 ? `(${selectedCount})` : ""}
            </Button>
          </div>
        ) : null}
      </div>

      {message ? (
        <p className="mb-4 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300">
          {message}
        </p>
      ) : null}

      {missingRows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-200 px-6 py-16 text-center dark:border-neutral-800">
          <ImageIcon className="mx-auto mb-4 h-10 w-10 text-neutral-300" />
          <p className="font-medium">All variants have linked images.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-neutral-200 bg-neutral-50 text-xs uppercase tracking-wider text-neutral-500 dark:border-neutral-800 dark:bg-neutral-950">
                <tr>
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium">SKU</th>
                  <th className="px-4 py-3 font-medium">Variant</th>
                  <th className="px-4 py-3 font-medium">Suggested</th>
                  <th className="px-4 py-3 font-medium">Choose image</th>
                </tr>
              </thead>
              <tbody>
                {missingRows.map((row) => {
                  const suggestions = suggestMediaForSku(row.sku, unusedMedia);
                  const selectedId = selection[row.variantId] ?? "";

                  return (
                    <tr
                      key={row.variantId}
                      className="border-b border-neutral-100 dark:border-neutral-900"
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium">{row.productName}</div>
                        <div className="text-xs text-neutral-500">{row.brand}</div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">{row.sku}</td>
                      <td className="px-4 py-3 text-neutral-600">
                        {row.color} / {row.size}
                      </td>
                      <td className="px-4 py-3">
                        {suggestions.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {suggestions.slice(0, 3).map((item) => (
                              <button
                                key={item.id}
                                type="button"
                                disabled={!canWrite}
                                onClick={() =>
                                  setSelection((current) => ({
                                    ...current,
                                    [row.variantId]: item.id,
                                  }))
                                }
                                className={cn(
                                  "relative h-12 w-12 overflow-hidden rounded-lg border",
                                  selectedId === item.id
                                    ? "border-primary ring-2 ring-primary/30"
                                    : "border-neutral-200 dark:border-neutral-700"
                                )}
                              >
                                <Image
                                  src={getMediaUrl(item.id)}
                                  alt={item.name}
                                  fill
                                  className="object-cover"
                                  unoptimized={shouldUnoptimize(getMediaUrl(item.id))}
                                />
                              </button>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-neutral-400">No match</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={selectedId}
                          disabled={!canWrite}
                          onChange={(event) =>
                            setSelection((current) => ({
                              ...current,
                              [row.variantId]: event.target.value,
                            }))
                          }
                          className="w-full min-w-[180px] rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-950"
                        >
                          <option value="">Select unused image…</option>
                          {unusedMedia.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.name}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

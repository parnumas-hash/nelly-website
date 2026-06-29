"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Plus, Upload, X } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useCatalog } from "@/context/CatalogContext";
import { AdminProduct } from "@/types";
import {
  buildMatrixRows,
  inferMatrixOptions,
  matrixRowsToFormData,
  MAX_VARIANT_IMAGES,
  parseOptionInput,
  suggestSku,
  VariantMatrixOptions,
  VariantMatrixRow,
} from "@/lib/variant-matrix";
import { formatPrice } from "@/lib/utils";
import { shouldUnoptimize } from "@/lib/image-utils";

interface VariantMatrixEditorProps {
  product: AdminProduct;
}

interface BulkValues {
  price: string;
  salePrice: string;
  stock: string;
  skuPrefix: string;
}

function OptionValueTags({
  label,
  description,
  values,
  onChange,
  placeholder,
}: {
  label: string;
  description?: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder: string;
}) {
  const [draft, setDraft] = useState("");

  const addValues = (raw: string) => {
    const next = parseOptionInput(raw);
    if (!next.length) return;
    onChange([...new Set([...values, ...next])]);
    setDraft("");
  };

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="mb-3">
        <p className="text-sm font-medium">{label}</p>
        {description && (
          <p className="mt-0.5 text-xs text-neutral-500">{description}</p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {values.map((value) => (
          <span
            key={value}
            className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-sm dark:border-neutral-700 dark:bg-neutral-950"
          >
            {value}
            <button
              type="button"
              onClick={() => onChange(values.filter((item) => item !== value))}
              className="rounded-full p-0.5 hover:bg-neutral-200 dark:hover:bg-neutral-800"
              aria-label={`Remove ${value}`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>

      <div className="mt-3 flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addValues(draft);
            }
          }}
          placeholder={placeholder}
          className="min-w-0 flex-1 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-800 dark:bg-neutral-950"
        />
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => addValues(draft)}
        >
          Add
        </Button>
      </div>
    </div>
  );
}

function VariantRowImages({
  imageIds,
  onChange,
}: {
  imageIds: string[];
  onChange: (ids: string[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { addMedia, getMediaUrl, storageError } = useCatalog();
  const [error, setError] = useState<string | null>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    setError(null);
    const next = [...imageIds];
    const remaining = MAX_VARIANT_IMAGES - next.length;

    if (remaining <= 0) {
      setError(`Maximum ${MAX_VARIANT_IMAGES} images per SKU.`);
      return;
    }

    for (const file of Array.from(files).slice(0, remaining)) {
      if (!file.type.startsWith("image/")) continue;
      try {
        const item = await addMedia(file);
        next.push(item.id);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed.");
        break;
      }
    }

    if (next.length !== imageIds.length) onChange(next);
    if (inputRef.current) inputRef.current.value = "";
  };

  const canAdd = imageIds.length < MAX_VARIANT_IMAGES;

  return (
    <div className="min-w-[11rem] space-y-1">
      <div className="flex flex-wrap gap-1.5">
        {imageIds.map((id, index) => {
          const url = getMediaUrl(id);
          return (
            <div
              key={id}
              className="group relative h-12 w-12 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-950"
            >
              <Image
                src={url}
                alt={`SKU image ${index + 1}`}
                fill
                className="object-cover"
                unoptimized={shouldUnoptimize(url)}
              />
              <button
                type="button"
                onClick={() => onChange(imageIds.filter((item) => item !== id))}
                className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                aria-label="Remove image"
              >
                <X className="h-2.5 w-2.5" />
              </button>
              {index === 0 && (
                <span className="absolute bottom-0 left-0 right-0 bg-black/50 py-px text-center text-[8px] text-white">
                  1st
                </span>
              )}
            </div>
          );
        })}
        {canAdd && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex h-12 w-12 items-center justify-center rounded-lg border border-dashed border-neutral-300 bg-neutral-50 hover:border-primary dark:border-neutral-700 dark:bg-neutral-950"
            aria-label="Add SKU images"
          >
            <Upload className="h-4 w-4 text-neutral-400" />
          </button>
        )}
      </div>
      <p className="text-[10px] text-neutral-400">
        {imageIds.length}/{MAX_VARIANT_IMAGES} images
      </p>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => void handleFiles(e.target.files)}
      />
      {(error || storageError) && (
        <p className="text-[10px] text-red-500">{error ?? storageError}</p>
      )}
    </div>
  );
}

export default function VariantMatrixEditor({
  product,
}: VariantMatrixEditorProps) {
  const { replaceVariants, getAdminProduct } = useCatalog();
  const liveProduct = getAdminProduct(product.id) ?? product;
  const variants = useMemo(
    () => liveProduct.variants ?? [],
    [liveProduct.variants]
  );

  const initialOptions = useMemo(
    () => inferMatrixOptions(variants),
    [variants]
  );

  const [options, setOptions] = useState<VariantMatrixOptions>(initialOptions);
  const [rows, setRows] = useState<VariantMatrixRow[]>(() =>
    buildMatrixRows(initialOptions, variants)
  );
  const [bulk, setBulk] = useState<BulkValues>({
    price: "",
    salePrice: "",
    stock: "",
    skuPrefix: "",
  });
  const [saveError, setSaveError] = useState("");
  const [saved, setSaved] = useState(false);

  const syncRowsFromOptions = useCallback(
    (nextOptions: VariantMatrixOptions) => {
      setRows((prev) => {
        const prevByKey = new Map(prev.map((row) => [row.key, row]));
        return buildMatrixRows(nextOptions, variants).map((row) => {
          const existing = prevByKey.get(row.key);
          return existing ? { ...row, ...existing, key: row.key } : row;
        });
      });
    },
    [variants]
  );

  useEffect(() => {
    setOptions(initialOptions);
    setRows(buildMatrixRows(initialOptions, variants));
  }, [liveProduct.updatedAt, initialOptions, variants]);

  const updateOptions = (patch: Partial<VariantMatrixOptions>) => {
    const next = { ...options, ...patch };
    setOptions(next);
    syncRowsFromOptions(next);
  };

  const updateRow = (key: string, patch: Partial<VariantMatrixRow>) => {
    setRows((prev) =>
      prev.map((row) => (row.key === key ? { ...row, ...patch } : row))
    );
    setSaved(false);
  };

  const applyBulk = () => {
    setRows((prev) =>
      prev.map((row) => ({
        ...row,
        price: bulk.price ? parseFloat(bulk.price) || row.price : row.price,
        salePrice: bulk.salePrice
          ? parseFloat(bulk.salePrice) || undefined
          : row.salePrice,
        stock: bulk.stock ? parseInt(bulk.stock, 10) || row.stock : row.stock,
        sku: bulk.skuPrefix
          ? suggestSku(bulk.skuPrefix, row.color, row.size, row.scent)
          : row.sku,
      }))
    );
    setSaved(false);
  };

  const handleSave = () => {
    setSaveError("");

    if (!options.colors.length || !options.sizes.length) {
      setSaveError("Add at least one color and one size.");
      return;
    }

    if (options.useScent && !options.scents.length) {
      setSaveError("Add at least one scent or disable the scent option.");
      return;
    }

    const invalid = rows.find(
      (row) => !row.sku.trim() || row.price <= 0 || row.stock < 0
    );
    if (invalid) {
      setSaveError(
        "Every variant needs a SKU, price greater than 0, and valid stock."
      );
      return;
    }

    const payload = matrixRowsToFormData(rows).map((data, index) => ({
      ...data,
      existingId: rows[index].existingId,
    }));

    replaceVariants(
      liveProduct.id,
      payload.map((item) => ({
        data: {
          color: item.color,
          size: item.size,
          scent: item.scent,
          sku: item.sku,
          barcode: item.barcode,
          price: item.price,
          salePrice: item.salePrice,
          stock: item.stock,
          imageIds: item.imageIds,
          status: item.status,
        },
        existingId: item.existingId,
      }))
    );
    setSaved(true);
  };

  return (
    <div className="space-y-6 rounded-2xl border border-neutral-200 bg-neutral-50/80 p-5 dark:border-neutral-800 dark:bg-neutral-950/50">
      <div>
        <h3 className="text-base font-semibold">Bulk Variant Matrix</h3>
        <p className="mt-1 text-sm text-neutral-500">
          Define colors and sizes once — all combinations are generated
          automatically, like Shopee Seller Centre.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <OptionValueTags
          label="Option 1 · Color"
          description="Each SKU row can have up to 5 images in the table below."
          values={options.colors}
          onChange={(colors) => updateOptions({ colors })}
          placeholder="e.g. BLACK, BROWN"
        />
        <OptionValueTags
          label="Option 2 · Size"
          values={options.sizes}
          onChange={(sizes) => updateOptions({ sizes })}
          placeholder="e.g. M, L, One Size"
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={options.useScent}
          onChange={(e) =>
            updateOptions({
              useScent: e.target.checked,
              scents: e.target.checked ? options.scents : [],
            })
          }
          className="rounded border-neutral-300"
        />
        Enable scent as a third option (for poop bags, treats, etc.)
      </label>

      {options.useScent && (
        <OptionValueTags
          label="Option 3 · Scent"
          values={options.scents}
          onChange={(scents) => updateOptions({ scents })}
          placeholder="e.g. Lavender, Unscented"
        />
      )}

      {rows.length > 0 ? (
        <>
          <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <p className="mb-3 text-sm font-medium">Apply to all variants</p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <Input
                id="bulk-price"
                label="Price (THB)"
                type="number"
                min="0"
                step="0.01"
                value={bulk.price}
                onChange={(e) =>
                  setBulk((prev) => ({ ...prev, price: e.target.value }))
                }
              />
              <Input
                id="bulk-sale"
                label="Sale Price"
                type="number"
                min="0"
                step="0.01"
                value={bulk.salePrice}
                onChange={(e) =>
                  setBulk((prev) => ({ ...prev, salePrice: e.target.value }))
                }
              />
              <Input
                id="bulk-stock"
                label="Stock"
                type="number"
                min="0"
                value={bulk.stock}
                onChange={(e) =>
                  setBulk((prev) => ({ ...prev, stock: e.target.value }))
                }
              />
              <Input
                id="bulk-sku"
                label="SKU prefix"
                value={bulk.skuPrefix}
                onChange={(e) =>
                  setBulk((prev) => ({ ...prev, skuPrefix: e.target.value }))
                }
                placeholder={liveProduct.name.slice(0, 12)}
              />
              <div className="flex items-end">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={applyBulk}
                >
                  Update all
                </Button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-xs uppercase tracking-wide text-neutral-500 dark:border-neutral-800 dark:bg-neutral-950">
                  <th className="px-4 py-3">Images</th>
                  <th className="px-4 py-3">Color</th>
                  <th className="px-4 py-3">Size</th>
                  {options.useScent && <th className="px-4 py-3">Scent</th>}
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3">SKU</th>
                  <th className="px-4 py-3">Barcode</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.key}
                    className="border-b border-neutral-100 dark:border-neutral-800"
                  >
                    <td className="px-4 py-3 align-top">
                      <VariantRowImages
                        imageIds={row.imageIds}
                        onChange={(imageIds) =>
                          updateRow(row.key, { imageIds })
                        }
                      />
                    </td>
                    <td className="px-4 py-3 font-medium">{row.color}</td>
                    <td className="px-4 py-3 font-medium">{row.size}</td>
                    {options.useScent && (
                      <td className="px-4 py-3">{row.scent || "—"}</td>
                    )}
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={row.price || ""}
                        onChange={(e) =>
                          updateRow(row.key, {
                            price: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-24 rounded-lg border border-neutral-200 px-2 py-1.5 dark:border-neutral-700 dark:bg-neutral-950"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min="0"
                        value={row.stock || ""}
                        onChange={(e) =>
                          updateRow(row.key, {
                            stock: parseInt(e.target.value, 10) || 0,
                          })
                        }
                        className="w-20 rounded-lg border border-neutral-200 px-2 py-1.5 dark:border-neutral-700 dark:bg-neutral-950"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        value={row.sku}
                        onChange={(e) =>
                          updateRow(row.key, { sku: e.target.value })
                        }
                        className="min-w-[8rem] rounded-lg border border-neutral-200 px-2 py-1.5 dark:border-neutral-700 dark:bg-neutral-950"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        value={row.barcode}
                        onChange={(e) =>
                          updateRow(row.key, { barcode: e.target.value })
                        }
                        className="min-w-[7rem] rounded-lg border border-neutral-200 px-2 py-1.5 dark:border-neutral-700 dark:bg-neutral-950"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button type="button" onClick={handleSave}>
              Save {rows.length} variants
            </Button>
            <span className="text-sm text-neutral-500">
              {rows.length} combinations · listing from{" "}
              {formatPrice(Math.min(...rows.map((row) => row.price)))}
            </span>
            {saved && (
              <span className="text-sm text-green-600">Saved successfully</span>
            )}
            {saveError && (
              <span className="text-sm text-red-500">{saveError}</span>
            )}
          </div>
        </>
      ) : (
        <div className="rounded-xl border border-dashed border-neutral-300 px-6 py-10 text-center dark:border-neutral-700">
          <Plus className="mx-auto mb-2 h-5 w-5 text-neutral-400" />
          <p className="text-sm text-neutral-500">
            Add color and size values above to generate the variant table.
          </p>
        </div>
      )}
    </div>
  );
}

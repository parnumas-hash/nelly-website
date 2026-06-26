"use client";

import { useState } from "react";
import SafeImage from "@/components/ui/SafeImage";
import { Copy, Pencil, Plus, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import VariantEditor from "@/components/admin/VariantEditor";
import VariantMatrixEditor from "@/components/admin/VariantMatrixEditor";
import { useCatalog } from "@/context/CatalogContext";
import { AdminProduct, ProductVariant, VariantFormData } from "@/types";
import {
  formatVariantLabel,
  getVariantDisplayPrice,
  isVariantInStock,
  resolveVariantThumbnail,
} from "@/lib/variants";
import { formatPrice, cn } from "@/lib/utils";

interface ProductVariantsProps {
  product: AdminProduct;
}

type ViewMode = "matrix" | "list";

export default function ProductVariants({ product: initial }: ProductVariantsProps) {
  const {
    addVariant,
    updateVariant,
    deleteVariant,
    duplicateVariant,
    getAdminProduct,
    getMediaUrl,
  } = useCatalog();
  const product = getAdminProduct(initial.id) ?? initial;
  const variants = product.variants ?? [];
  const [viewMode, setViewMode] = useState<ViewMode>("matrix");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const handleSaveNew = (data: VariantFormData) => {
    addVariant(product.id, data);
    setIsAdding(false);
  };

  const handleSaveEdit = (data: VariantFormData) => {
    if (!editingId) return;
    updateVariant(product.id, editingId, data);
    setEditingId(null);
  };

  const handleDuplicate = (variant: ProductVariant) => {
    duplicateVariant(product.id, variant.id);
  };

  const handleDelete = (variant: ProductVariant) => {
    if (
      confirm(
        `Delete variant ${formatVariantLabel(variant)} (${variant.sku})?`
      )
    ) {
      deleteVariant(product.id, variant.id);
      if (editingId === variant.id) setEditingId(null);
    }
  };

  return (
    <div className="mt-10 border-t border-neutral-200 pt-10 dark:border-neutral-800">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Product Variants
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            {variants.length} variant
            {variants.length !== 1 ? "s" : ""} · bulk matrix or single edit
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex rounded-full border border-neutral-200 p-1 dark:border-neutral-800">
            <button
              type="button"
              onClick={() => setViewMode("matrix")}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                viewMode === "matrix"
                  ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                  : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
              )}
            >
              Bulk matrix
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                viewMode === "list"
                  ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                  : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
              )}
            >
              Single edit
            </button>
          </div>
          {viewMode === "list" && !isAdding && !editingId && (
            <Button
              type="button"
              size="sm"
              className="gap-2"
              onClick={() => setIsAdding(true)}
            >
              <Plus className="h-4 w-4" />
              Add Variant
            </Button>
          )}
        </div>
      </div>

      {viewMode === "matrix" ? (
        <VariantMatrixEditor product={product} />
      ) : (
        <>
          {isAdding && (
            <div className="mb-6">
              <VariantEditor
                onSave={handleSaveNew}
                onCancel={() => setIsAdding(false)}
              />
            </div>
          )}

          {variants.length === 0 && !isAdding ? (
            <div className="rounded-xl border border-dashed border-neutral-200 px-6 py-12 text-center dark:border-neutral-800">
              <p className="text-sm text-neutral-500">
                No variants yet. Use the bulk matrix tab to add many at once, or
                add a single variant here.
              </p>
              <Button
                type="button"
                size="sm"
                className="mt-4 gap-2"
                onClick={() => setViewMode("matrix")}
              >
                Open bulk matrix
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {variants.map((variant) => {
                const { price, originalPrice } = getVariantDisplayPrice(variant);
                const inStock = isVariantInStock(variant);

                if (editingId === variant.id) {
                  return (
                    <VariantEditor
                      key={variant.id}
                      variant={variant}
                      onSave={handleSaveEdit}
                      onCancel={() => setEditingId(null)}
                    />
                  );
                }

                return (
                  <div
                    key={variant.id}
                    className="flex flex-wrap items-center gap-4 rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
                  >
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                      <SafeImage
                        src={resolveVariantThumbnail(
                          variant,
                          product,
                          getMediaUrl
                        )}
                        alt=""
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">
                          {formatVariantLabel(variant)}
                        </span>
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider",
                            inStock
                              ? "bg-green-100 text-green-700"
                              : "bg-neutral-100 text-neutral-500"
                          )}
                        >
                          {variant.status === "available" && variant.stock > 0
                            ? "Available"
                            : "Out of Stock"}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-neutral-500">
                        SKU: {variant.sku}
                        {variant.barcode && ` · Barcode: ${variant.barcode}`}
                      </p>
                      <p className="mt-0.5 text-sm">
                        {formatPrice(price)}
                        {originalPrice && (
                          <span className="ml-2 text-neutral-400 line-through">
                            {formatPrice(originalPrice)}
                          </span>
                        )}
                        <span className="ml-2 text-neutral-500">
                          · {variant.stock} in stock
                        </span>
                        {variant.imageIds && variant.imageIds.length > 1 && (
                          <span className="ml-2 text-neutral-400">
                            · {variant.imageIds.length} images
                          </span>
                        )}
                      </p>
                    </div>

                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsAdding(false);
                          setEditingId(variant.id);
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDuplicate(variant)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
                        title="Duplicate"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(variant)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 hover:bg-red-50"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import SortableImageUpload from "@/components/admin/SortableImageUpload";
import {
  ProductVariant,
  VariantFormData,
  VariantStatus,
} from "@/types";
import {
  emptyVariantForm,
  getVariantDisplayPrice,
  variantToFormData,
} from "@/lib/variants";
import { MAX_VARIANT_IMAGES } from "@/lib/variant-matrix";
import { formatPrice } from "@/lib/utils";

interface VariantEditorProps {
  variant?: ProductVariant;
  onSave: (data: VariantFormData) => void;
  onCancel: () => void;
}

export default function VariantEditor({
  variant,
  onSave,
  onCancel,
}: VariantEditorProps) {
  const [form, setForm] = useState<VariantFormData>(
    variant ? variantToFormData(variant) : emptyVariantForm()
  );

  useEffect(() => {
    setForm(variant ? variantToFormData(variant) : emptyVariantForm());
  }, [variant]);

  const update = <K extends keyof VariantFormData>(
    key: K,
    value: VariantFormData[K]
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  const display = getVariantDisplayPrice(
    form.price > 0
      ? ({
          ...form,
          id: variant?.id ?? "preview",
        } as ProductVariant)
      : null
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-neutral-200 bg-neutral-50 p-5 dark:border-neutral-800 dark:bg-neutral-950"
    >
      <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Input
          id="variant-color"
          label="Color"
          value={form.color}
          onChange={(e) => update("color", e.target.value)}
          required
        />
        <Input
          id="variant-size"
          label="Size"
          value={form.size}
          onChange={(e) => update("size", e.target.value)}
          required
        />
        <Input
          id="variant-scent"
          label="Scent"
          value={form.scent}
          onChange={(e) => update("scent", e.target.value)}
          placeholder="Optional — e.g. Lavender"
        />
        <Input
          id="variant-sku"
          label="SKU"
          value={form.sku}
          onChange={(e) => update("sku", e.target.value)}
          required
        />
        <Input
          id="variant-barcode"
          label="Barcode"
          value={form.barcode}
          onChange={(e) => update("barcode", e.target.value)}
        />
        <Input
          id="variant-price"
          label="Price (THB)"
          type="number"
          min="0"
          step="0.01"
          value={form.price || ""}
          onChange={(e) => update("price", parseFloat(e.target.value) || 0)}
          required
        />
        <Input
          id="variant-salePrice"
          label="Sale Price (THB)"
          type="number"
          min="0"
          step="0.01"
          value={form.salePrice ?? ""}
          onChange={(e) =>
            update(
              "salePrice",
              e.target.value ? parseFloat(e.target.value) : undefined
            )
          }
        />
        <Input
          id="variant-stock"
          label="Stock Quantity"
          type="number"
          min="0"
          value={form.stock || ""}
          onChange={(e) => update("stock", parseInt(e.target.value) || 0)}
          required
        />
        <div>
          <label className="mb-2 block text-sm font-medium">Status</label>
          <select
            value={form.status}
            onChange={(e) => update("status", e.target.value as VariantStatus)}
            className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm dark:border-neutral-800 dark:bg-neutral-950"
          >
            <option value="available">Available</option>
            <option value="out-of-stock">Out of Stock</option>
          </select>
        </div>
      </div>

      <SortableImageUpload
        imageIds={form.imageIds}
        onChange={(imageIds) => update("imageIds", imageIds)}
        label={`Variant Images (max ${MAX_VARIANT_IMAGES})`}
      />

      {form.price > 0 && (
        <p className="mt-3 text-xs text-neutral-500">
          Storefront price: {formatPrice(display.price)}
          {display.originalPrice && (
            <span className="ml-2 line-through">
              {formatPrice(display.originalPrice)}
            </span>
          )}
        </p>
      )}

      <div className="mt-4 flex gap-2">
        <Button type="submit" size="sm">
          {variant ? "Update Variant" : "Add Variant"}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

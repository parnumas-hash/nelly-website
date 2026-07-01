"use client";

import { useMemo } from "react";
import { getProductPrimarySku } from "@/lib/variants";
import { Product } from "@/types";

const SELECT_CLASS =
  "w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm focus:border-primary focus:outline-none dark:border-neutral-800 dark:bg-neutral-950";

interface ProductIdPickerFieldsProps {
  label?: string;
  description: string;
  maxSlots: number;
  productIds: string[];
  onChange: (productIds: string[]) => void;
  publishedProducts: Product[];
}

export default function ProductIdPickerFields({
  label = "Featured products",
  description,
  maxSlots,
  productIds,
  onChange,
  publishedProducts,
}: ProductIdPickerFieldsProps) {
  const sortedProducts = useMemo(
    () =>
      [...publishedProducts].sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
      ),
    [publishedProducts]
  );

  const usingManualSelection = productIds.some(Boolean);

  const setProductSlot = (slot: number, value: string) => {
    const next = Array.from({ length: maxSlots }, (_, index) => productIds[index] ?? "");
    next[slot] = value;
    onChange(next.filter(Boolean));
  };

  return (
    <div className="space-y-3 rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
            {label}
          </p>
          <p className="mt-1 text-xs text-neutral-500">{description}</p>
        </div>
        {usingManualSelection ? (
          <button
            type="button"
            onClick={() => onChange([])}
            className="shrink-0 text-xs font-medium text-primary hover:underline"
          >
            Use automatic
          </button>
        ) : null}
      </div>

      {Array.from({ length: maxSlots }, (_, slot) => (
        <div key={slot}>
          <label
            htmlFor={`product-picker-${slot}`}
            className="mb-2 block text-xs font-medium uppercase tracking-wide text-neutral-500"
          >
            Product {slot + 1}
          </label>
          <select
            id={`product-picker-${slot}`}
            value={productIds[slot] ?? ""}
            onChange={(e) => setProductSlot(slot, e.target.value)}
            className={SELECT_CLASS}
          >
            <option value="">— Not selected —</option>
            {sortedProducts.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} ({getProductPrimarySku(product.variants)})
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}

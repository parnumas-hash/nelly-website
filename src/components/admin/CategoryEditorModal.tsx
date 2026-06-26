"use client";

import { useEffect, useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import CategoryImageUpload from "@/components/admin/CategoryImageUpload";
import { BrandCategory, PetType } from "@/types";
import {
  CategoryFormState,
  PET_TYPE_LABELS,
  categoryToForm,
  createCategorySlug,
  emptyCategoryForm,
  formToCategory,
} from "@/lib/brand-categories";

interface CategoryEditorModalProps {
  open: boolean;
  category?: BrandCategory;
  existingSlugs: string[];
  nextSortOrder: number;
  onSave: (category: BrandCategory) => void;
  onClose: () => void;
}

export default function CategoryEditorModal({
  open,
  category,
  existingSlugs,
  nextSortOrder,
  onSave,
  onClose,
}: CategoryEditorModalProps) {
  const [form, setForm] = useState<CategoryFormState>(
    category
      ? categoryToForm(category)
      : { ...emptyCategoryForm(existingSlugs), sortOrder: nextSortOrder }
  );

  useEffect(() => {
    if (!open) return;
    setForm(
      category
        ? categoryToForm(category)
        : { ...emptyCategoryForm(existingSlugs), sortOrder: nextSortOrder }
    );
  }, [open, category, existingSlugs, nextSortOrder]);

  if (!open) return null;

  const update = <K extends keyof CategoryFormState>(
    key: K,
    value: CategoryFormState[K]
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const saved = formToCategory(form, category, existingSlugs);
    onSave(saved);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl dark:bg-neutral-900">
        <form onSubmit={handleSubmit} className="p-6">
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-primary">
            {category ? "Edit Category" : "Add Category"}
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-neutral-900 dark:text-white">
            {category ? category.name : "New Category"}
          </h2>

          <div className="mt-6 space-y-4">
            <Input
              id="category-name"
              label="Category Name"
              value={form.name}
              onChange={(e) => {
                const name = e.target.value;
                update("name", name);
                if (!category) {
                  update(
                    "slug",
                    createCategorySlug(name, existingSlugs)
                  );
                }
              }}
              required
            />

            <Input
              id="category-slug"
              label="URL Slug"
              value={form.slug}
              onChange={(e) => update("slug", e.target.value)}
              required
            />

            <div>
              <label className="mb-2 block text-sm font-medium">Pet Type</label>
              <select
                value={form.petType}
                onChange={(e) => update("petType", e.target.value as PetType)}
                className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm dark:border-neutral-800 dark:bg-neutral-950"
              >
                {(Object.keys(PET_TYPE_LABELS) as PetType[]).map((petType) => (
                  <option key={petType} value={petType}>
                    {PET_TYPE_LABELS[petType]}
                  </option>
                ))}
              </select>
            </div>

            <CategoryImageUpload
              imageId={form.imageId}
              categoryName={form.name}
              onChange={(imageId) => update("imageId", imageId)}
            />

            <Input
              id="category-sort"
              label="Sort Order"
              type="number"
              min="0"
              value={form.sortOrder}
              onChange={(e) => update("sortOrder", parseInt(e.target.value, 10) || 0)}
            />

            <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => update("active", e.target.checked)}
                className="rounded border-neutral-300 text-primary focus:ring-primary"
              />
              Active on storefront
            </label>
          </div>

          <div className="mt-6 flex gap-3 border-t border-neutral-200 pt-6 dark:border-neutral-800">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              {category ? "Save Category" : "Add Category"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

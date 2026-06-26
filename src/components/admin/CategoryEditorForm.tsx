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

interface CategoryEditorFormProps {
  category?: BrandCategory;
  existingSlugs: string[];
  nextSortOrder: number;
  onSave: (category: BrandCategory) => void;
  onCancel: () => void;
}

export default function CategoryEditorForm({
  category,
  existingSlugs,
  nextSortOrder,
  onSave,
  onCancel,
}: CategoryEditorFormProps) {
  const [form, setForm] = useState<CategoryFormState>(
    category
      ? categoryToForm(category)
      : { ...emptyCategoryForm(existingSlugs), sortOrder: nextSortOrder }
  );

  useEffect(() => {
    setForm(
      category
        ? categoryToForm(category)
        : { ...emptyCategoryForm(existingSlugs), sortOrder: nextSortOrder }
    );
  }, [category, existingSlugs, nextSortOrder]);

  const update = <K extends keyof CategoryFormState>(
    key: K,
    value: CategoryFormState[K]
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formToCategory(form, category, existingSlugs));
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-primary/20 bg-primary/5 p-5 dark:border-primary/30 dark:bg-primary/10 md:p-6"
    >
      <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-primary">
        {category ? "Edit Category" : "Add Category"}
      </p>
      <h2 className="mt-1 text-lg font-semibold tracking-tight text-neutral-900 dark:text-white">
        {category ? category.name : "New Category"}
      </h2>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <Input
          id="category-name"
          label="Category Name"
          value={form.name}
          onChange={(e) => {
            const name = e.target.value;
            update("name", name);
            if (!category) {
              update("slug", createCategorySlug(name, existingSlugs));
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

        <Input
          id="category-sort"
          label="Sort Order"
          type="number"
          min="0"
          value={form.sortOrder}
          onChange={(e) =>
            update("sortOrder", parseInt(e.target.value, 10) || 0)
          }
        />

        <div className="md:col-span-2">
          <CategoryImageUpload
            imageId={form.imageId}
            categoryName={form.name}
            onChange={(imageId) => update("imageId", imageId)}
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-neutral-700 md:col-span-2 dark:text-neutral-300">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) => update("active", e.target.checked)}
            className="rounded border-neutral-300 text-primary focus:ring-primary"
          />
          Active on storefront
        </label>
      </div>

      <div className="mt-5 flex flex-wrap gap-3 border-t border-primary/10 pt-5">
        <Button type="submit">
          {category ? "Save Changes" : "Add Category"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

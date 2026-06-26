"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
  ArrowDown,
  ArrowUp,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import Button from "@/components/ui/Button";
import CategoryEditorForm from "@/components/admin/CategoryEditorForm";
import { useCatalog } from "@/context/CatalogContext";
import { BrandCategory } from "@/types";
import {
  PET_TYPE_LABELS,
  reorderCategories,
  sortCategories,
} from "@/lib/brand-categories";
import { resolveCategoryImageUrl, shouldUnoptimize } from "@/lib/image-utils";
import { cn } from "@/lib/utils";

export default function CategoriesAdminPage() {
  const {
    categories,
    updateCategories,
    getMediaUrl,
    adminProducts,
    ready,
  } = useCatalog();
  const [editingCategory, setEditingCategory] = useState<
    BrandCategory | undefined | "new"
  >(undefined);

  const sortedCategories = useMemo(
    () => sortCategories(categories),
    [categories]
  );
  const existingSlugs = sortedCategories.map((category) => category.slug);
  const isEditing = editingCategory !== undefined;

  if (!ready) {
    return <div className="py-20 text-center text-neutral-400">Loading...</div>;
  }

  const persistCategories = (next: BrandCategory[]) => {
    updateCategories(next);
  };

  const handleSaveCategory = (category: BrandCategory) => {
    const exists = sortedCategories.some((item) => item.id === category.id);
    const next = exists
      ? sortedCategories.map((item) =>
          item.id === category.id ? category : item
        )
      : [...sortedCategories, category];
    persistCategories(sortCategories(next));
    setEditingCategory(undefined);
  };

  const handleDelete = (categoryId: string) => {
    const category = sortedCategories.find((item) => item.id === categoryId);
    const productCount = adminProducts.filter(
      (product) => product.categoryId === categoryId
    ).length;

    const message =
      productCount > 0
        ? `Delete "${category?.name}"? ${productCount} product(s) use this category.`
        : `Delete "${category?.name}"?`;

    if (!window.confirm(message)) return;
    persistCategories(
      sortedCategories.filter((item) => item.id !== categoryId)
    );
    if (editingCategory !== "new" && editingCategory?.id === categoryId) {
      setEditingCategory(undefined);
    }
  };

  const moveCategory = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= sortedCategories.length) return;
    persistCategories(reorderCategories(sortedCategories, index, target));
  };

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-primary">
            Catalog
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight md:text-3xl">
            Categories
          </h1>
          <p className="mt-2 max-w-2xl text-neutral-500">
            Manage all product categories in one place. Categories are shared
            across every brand.
          </p>
        </div>
        {!isEditing && (
          <Button
            className="gap-2"
            onClick={() => setEditingCategory("new")}
          >
            <Plus className="h-4 w-4" />
            Add Category
          </Button>
        )}
      </div>

      {isEditing && (
        <div className="mb-8">
          <CategoryEditorForm
            category={editingCategory === "new" ? undefined : editingCategory}
            existingSlugs={existingSlugs}
            nextSortOrder={sortedCategories.length}
            onSave={handleSaveCategory}
            onCancel={() => setEditingCategory(undefined)}
          />
        </div>
      )}

      <div className="rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <div className="border-b border-neutral-200 px-5 py-4 dark:border-neutral-800">
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">
            All Categories ({sortedCategories.length})
          </h2>
          <p className="mt-1 text-xs text-neutral-500">
            Rename, reorder, edit, or delete categories below.
          </p>
        </div>

        {sortedCategories.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-neutral-500">No categories yet.</p>
            {!isEditing && (
              <Button
                className="mt-4 gap-2"
                onClick={() => setEditingCategory("new")}
              >
                <Plus className="h-4 w-4" />
                Add First Category
              </Button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {sortedCategories.map((category, index) => {
              const imageUrl = resolveCategoryImageUrl(category, getMediaUrl);
              const isActiveEdit =
                editingCategory !== "new" &&
                editingCategory?.id === category.id;

              return (
                <div
                  key={category.id}
                  className={cn(
                    "flex flex-wrap items-center gap-4 p-4 md:p-5",
                    isActiveEdit && "bg-primary/5 dark:bg-primary/10"
                  )}
                >
                  <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-xl bg-neutral-50">
                    <Image
                      src={imageUrl}
                      alt={category.name}
                      fill
                      className="object-cover"
                      unoptimized={shouldUnoptimize(imageUrl)}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-neutral-900 dark:text-white">
                        {category.name}
                      </h3>
                      <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-neutral-500 dark:bg-neutral-800">
                        {PET_TYPE_LABELS[category.petType]}
                      </span>
                      {!category.active && (
                        <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-red-600">
                          Hidden
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-neutral-500">
                      /{category.slug} · Sort {category.sortOrder + 1}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => moveCategory(index, -1)}
                      disabled={index === 0}
                      className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 disabled:opacity-30 dark:hover:bg-neutral-800"
                      aria-label="Move up"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveCategory(index, 1)}
                      disabled={index === sortedCategories.length - 1}
                      className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 disabled:opacity-30 dark:hover:bg-neutral-800"
                      aria-label="Move down"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => setEditingCategory(category)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-1.5 text-red-600 hover:border-red-200 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/30"
                      onClick={() => handleDelete(category.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

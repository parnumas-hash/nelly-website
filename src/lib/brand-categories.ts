import { AdminBrand, BrandCategory, PetType, ProductPetType } from "@/types";
import { categories as shopCategories } from "@/lib/products";
import { slugify } from "@/lib/utils";

export const PET_TYPE_LABELS: Record<PetType, string> = {
  dog: "Dog",
  cat: "Cat",
  both: "Both",
};

export const PRODUCT_PET_TYPE_LABELS: Record<ProductPetType, string> = {
  dog: "Dog",
  cat: "Cat",
};

export function createCategorySlug(name: string, existing: string[]): string {
  const base = slugify(name);
  let slug = base;
  let i = 1;
  while (existing.includes(slug)) {
    slug = `${base}-${i++}`;
  }
  return slug;
}

export function sortCategories(categories: BrandCategory[]): BrandCategory[] {
  return [...categories].sort((a, b) => a.sortOrder - b.sortOrder);
}

export function sortBrandsAlphabetically<
  T extends { displayName?: string; name: string },
>(brands: T[]): T[] {
  return [...brands].sort((a, b) =>
    (a.displayName || a.name).localeCompare(
      b.displayName || b.name,
      undefined,
      { sensitivity: "base" }
    )
  );
}

export function filterCategoriesForPetType(
  categories: BrandCategory[],
  petType: ProductPetType,
  activeOnly = true
): BrandCategory[] {
  return sortCategories(categories).filter((category) => {
    if (activeOnly && !category.active) return false;
    if (category.petType === "both") return true;
    return category.petType === petType;
  });
}

export interface ProductFormCategoryOption {
  id: string;
  name: string;
  slug: string;
}

/** Shared shop categories — use global list from CatalogContext. */
export function getProductFormCategoryOptions(
  categories: BrandCategory[],
  petType?: ProductPetType | ""
): ProductFormCategoryOption[] {
  if (categories.length > 0) {
    const filtered = petType
      ? filterCategoriesForPetType(categories, petType)
      : sortCategories(categories).filter((category) => category.active);

    return filtered.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
    }));
  }

  return shopCategories
    .filter((category) => category.id !== "all")
    .map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
    }));
}

export function resolveProductFormCategory(
  categories: BrandCategory[],
  categoryId: string
): ProductFormCategoryOption | undefined {
  const match = getCategoryById(categories, categoryId);
  if (match) {
    return {
      id: match.id,
      name: match.name,
      slug: match.slug,
    };
  }

  const legacyCategory = shopCategories.find(
    (category) => category.id === categoryId
  );
  if (!legacyCategory) return undefined;

  return {
    id: legacyCategory.id,
    name: legacyCategory.name,
    slug: legacyCategory.slug,
  };
}

export function getCategoryById(
  categories: BrandCategory[],
  categoryId: string
): BrandCategory | undefined {
  return categories.find((category) => category.id === categoryId);
}

export function getCategoryBySlug(
  categories: BrandCategory[],
  slug: string
): BrandCategory | undefined {
  return categories.find((category) => category.slug === slug);
}

export function getBrandCategoryById(
  brand: AdminBrand | undefined,
  categoryId: string
): BrandCategory | undefined {
  return brand?.categories?.find((category) => category.id === categoryId);
}

export function getBrandCategoryBySlug(
  brand: AdminBrand | undefined,
  slug: string
): BrandCategory | undefined {
  return brand?.categories?.find((category) => category.slug === slug);
}

export function getBrandBySlug(
  brands: AdminBrand[],
  slug: string
): AdminBrand | undefined {
  return brands.find((brand) => brand.slug === slug);
}

export function getBrandById(
  brands: AdminBrand[],
  id: string
): AdminBrand | undefined {
  return brands.find((brand) => brand.id === id);
}

export function reorderCategories(
  categories: BrandCategory[],
  fromIndex: number,
  toIndex: number
): BrandCategory[] {
  const next = sortCategories(categories);
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next.map((category, index) => ({ ...category, sortOrder: index }));
}

export function normalizeBrandCategories(
  categories: BrandCategory[] | undefined
): BrandCategory[] {
  if (!Array.isArray(categories)) return [];
  return sortCategories(
    categories.map((category, index) => ({
      ...category,
      sortOrder:
        typeof category.sortOrder === "number" ? category.sortOrder : index,
      active: category.active !== false,
    }))
  );
}

export function emptyCategoryForm(existingSlugs: string[] = []) {
  return {
    name: "",
    slug: "",
    petType: "dog" as PetType,
    imageId: "",
    sortOrder: 0,
    active: true,
    existingSlugs,
  };
}

export type CategoryFormState = ReturnType<typeof emptyCategoryForm>;

export function categoryToForm(category: BrandCategory): CategoryFormState {
  return {
    name: category.name,
    slug: category.slug,
    petType: category.petType,
    imageId: category.imageId ?? "",
    sortOrder: category.sortOrder,
    active: category.active,
    existingSlugs: [],
  };
}

export function formToCategory(
  form: CategoryFormState,
  existing?: BrandCategory,
  allSlugs: string[] = []
): BrandCategory {
  const slug =
    form.slug ||
    createCategorySlug(
      form.name,
      allSlugs.filter((value) => value !== existing?.slug)
    );

  return {
    id: existing?.id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    name: form.name.trim(),
    slug,
    petType: form.petType,
    imageId: form.imageId || undefined,
    sortOrder: form.sortOrder,
    active: form.active,
  };
}

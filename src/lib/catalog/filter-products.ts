import { getCategoryBySlug } from "@/lib/brand-categories";
import {
  filterShopVisibleProducts,
  productMatchesPetTypeFilter,
} from "@/lib/shop-filters";
import { brandToSlug } from "@/lib/utils";
import { AdminBrand, BrandCategory, Product, ProductFilters } from "@/types";

export function filterPublishedProducts(
  products: Product[],
  brands: AdminBrand[],
  categories: BrandCategory[],
  filters: ProductFilters
): Product[] {
  let result = filterShopVisibleProducts(products);

  if (filters.brand) {
    result = result.filter(
      (p) =>
        brandToSlug(p.brand) === filters.brand!.toLowerCase() ||
        p.brandId === brands.find((brand) => brand.slug === filters.brand)?.id
    );
  }

  if (filters.petType) {
    result = result.filter((p) =>
      productMatchesPetTypeFilter(p, filters.petType!)
    );
  }

  if (filters.categoryId) {
    result = result.filter((p) => p.categoryId === filters.categoryId);
  } else if (filters.category && filters.category !== "all") {
    result = result.filter((p) => {
      const category = getCategoryBySlug(categories, filters.category!);
      if (category) {
        return p.categoryId === category.id;
      }
      return p.category === filters.category;
    });
  }

  if (filters.query) {
    const q = filters.query.toLowerCase();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.subCategoryName ?? "").toLowerCase().includes(q) ||
        (p.variants ?? []).some(
          (v) =>
            v.sku.toLowerCase().includes(q) ||
            v.color.toLowerCase().includes(q) ||
            (v.scent ?? "").toLowerCase().includes(q)
        )
    );
  }

  switch (filters.sort) {
    case "price-asc":
      result.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      result.sort((a, b) => b.price - a.price);
      break;
    case "newest":
      result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
      break;
    default:
      result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  }

  return result;
}

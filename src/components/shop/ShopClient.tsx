"use client";

import { useSearchParams } from "next/navigation";
import { useState, useMemo, useEffect } from "react";
import { SlidersHorizontal } from "lucide-react";
import PageTransition from "@/components/ui/PageTransition";
import ProductCard from "@/components/product/ProductCard";
import { useCatalog } from "@/context/CatalogContext";
import {
  AdminBrand,
  BrandCategory,
  Product,
  ProductPetType,
  SortOption,
} from "@/types";
import { getCategoryBySlug } from "@/lib/brand-categories";
import {
  getAvailableBrandCategoriesForShop,
  getAvailableLegacyCategoriesForShop,
  getAvailablePetTypesForBrand,
  getAvailableShopCategoriesForBrand,
  getBrandProductsForShop,
  getBrandsWithShopProducts,
} from "@/lib/shop-filters";
import { filterPublishedProducts } from "@/lib/catalog/filter-products";
import { cn } from "@/lib/utils";

function buildShopHref(params: Record<string, string | undefined>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) search.set(key, value);
  });
  const query = search.toString();
  return query ? `/shop?${query}` : "/shop";
}

interface ShopClientProps {
  initialProducts: Product[];
  initialBrands: AdminBrand[];
  initialCategories: BrandCategory[];
  initialSort: SortOption;
}

export default function ShopClient({
  initialProducts,
  initialBrands,
  initialCategories,
  initialSort,
}: ShopClientProps) {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category") || "";
  const brandParam = searchParams.get("brand") || "";
  const petTypeParam = (searchParams.get("petType") as ProductPetType) || "";
  const sortParam = (searchParams.get("sort") as SortOption) || initialSort;
  const [sort, setSort] = useState<SortOption>(sortParam);
  const [showFilters, setShowFilters] = useState(false);

  const {
    filterProducts,
    publishedProducts,
    brands: catalogBrands,
    categories: catalogCategories,
    getBrandBySlug,
    ready,
  } = useCatalog();

  const brands = ready ? catalogBrands : initialBrands;
  const categories = ready ? catalogCategories : initialCategories;
  const sourceProducts = ready ? publishedProducts : initialProducts;

  useEffect(() => {
    setSort(sortParam);
  }, [sortParam]);

  const activeBrand = brandParam ? getBrandBySlug(brandParam) : undefined;
  const activeCategory = categoryParam
    ? getCategoryBySlug(categories, categoryParam)
    : undefined;

  const shopBrands = useMemo(
    () => getBrandsWithShopProducts(sourceProducts, brands),
    [sourceProducts, brands]
  );

  const availablePetTypes = useMemo(() => {
    if (!activeBrand) return [];
    return getAvailablePetTypesForBrand(sourceProducts, activeBrand);
  }, [activeBrand, sourceProducts]);

  const brandCategories = useMemo(() => {
    if (!activeBrand) return [];
    if (petTypeParam) {
      return getAvailableBrandCategoriesForShop(
        sourceProducts,
        categories,
        activeBrand,
        petTypeParam
      );
    }
    return getAvailableShopCategoriesForBrand(
      sourceProducts,
      categories,
      activeBrand
    );
  }, [activeBrand, petTypeParam, sourceProducts, categories]);

  const legacyCategories = useMemo(() => {
    if (activeBrand) return [];
    return getAvailableLegacyCategoriesForShop(
      sourceProducts,
      brands,
      brandParam || undefined
    );
  }, [activeBrand, sourceProducts, brands, brandParam]);

  const showAllCategory = useMemo(() => {
    if (!activeBrand) return false;
    return (
      getBrandProductsForShop(
        sourceProducts,
        activeBrand,
        petTypeParam || undefined
      ).length > 0
    );
  }, [activeBrand, petTypeParam, sourceProducts]);

  const products = useMemo(() => {
    const filters = {
      category: categoryParam || undefined,
      brand: brandParam || undefined,
      petType: petTypeParam || undefined,
      sort,
    };

    if (ready) return filterProducts(filters);

    return filterPublishedProducts(
      initialProducts,
      initialBrands,
      initialCategories,
      filters
    );
  }, [
    ready,
    filterProducts,
    categoryParam,
    brandParam,
    petTypeParam,
    sort,
    initialProducts,
    initialBrands,
    initialCategories,
  ]);

  const pageTitle = activeCategory
    ? activeCategory.name
    : activeBrand
      ? activeBrand.tagline
      : "Shop";

  return (
    <PageTransition>
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
        <div className="mb-10">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.3em] text-primary">
            {activeBrand ? activeBrand.displayName : "Collection"}
          </p>
          <h1 className="font-display text-3xl font-bold tracking-tight md:text-5xl">
            {pageTitle}
          </h1>
          <p className="mt-3 text-neutral-500">
            {products.length} {products.length === 1 ? "product" : "products"}
            {activeBrand && ` from ${activeBrand.displayName}`}
            {petTypeParam && ` · ${petTypeParam === "dog" ? "Dog" : "Cat"}`}
          </p>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {shopBrands.map((brand) => (
            <a
              key={brand.id}
              href={buildShopHref({
                brand: brand.slug,
                sort: sort !== "featured" ? sort : undefined,
              })}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
                brandParam === brand.slug
                  ? "border-primary bg-primary text-white"
                  : "border-neutral-200 text-neutral-600 hover:border-neutral-400 dark:border-neutral-800 dark:text-neutral-400"
              )}
            >
              {brand.displayName}
            </a>
          ))}
          {(brandParam || petTypeParam || categoryParam) && (
            <a
              href="/shop"
              className="rounded-full px-3 py-1.5 text-xs font-medium text-primary hover:underline"
            >
              Clear filters
            </a>
          )}
        </div>

        {activeBrand && availablePetTypes.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            <a
              href={buildShopHref({
                brand: brandParam,
                category: categoryParam || undefined,
                sort: sort !== "featured" ? sort : undefined,
              })}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-all",
                !petTypeParam
                  ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-900 dark:text-neutral-400"
              )}
            >
              All pets
            </a>
            {availablePetTypes.map((petType) => (
              <a
                key={petType}
                href={buildShopHref({
                  brand: brandParam,
                  petType,
                  category: categoryParam || undefined,
                  sort: sort !== "featured" ? sort : undefined,
                })}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-all",
                  petTypeParam === petType
                    ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-900 dark:text-neutral-400"
                )}
              >
                {petType === "dog" ? "Dog" : "Cat"}
              </a>
            ))}
          </div>
        )}

        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {activeBrand && (showAllCategory || brandCategories.length > 0) ? (
              <>
                {showAllCategory && (
                  <a
                    href={buildShopHref({
                      brand: brandParam,
                      petType: petTypeParam || undefined,
                      sort: sort !== "featured" ? sort : undefined,
                    })}
                    className={cn(
                      "rounded-full px-4 py-2 text-sm font-medium transition-all",
                      !categoryParam
                        ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                        : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-900 dark:text-neutral-400"
                    )}
                  >
                    All
                  </a>
                )}
                {brandCategories.map((category) => (
                  <a
                    key={category.id}
                    href={buildShopHref({
                      brand: brandParam,
                      petType: petTypeParam || undefined,
                      category: category.slug,
                      sort: sort !== "featured" ? sort : undefined,
                    })}
                    className={cn(
                      "rounded-full px-4 py-2 text-sm font-medium transition-all",
                      categoryParam === category.slug
                        ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                        : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-900 dark:text-neutral-400"
                    )}
                  >
                    {category.name}
                  </a>
                ))}
              </>
            ) : legacyCategories.length > 0 ? (
              <>
                <a
                  href={buildShopHref({
                    brand: brandParam || undefined,
                    sort: sort !== "featured" ? sort : undefined,
                  })}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-medium transition-all duration-300",
                    !categoryParam
                      ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                      : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-900 dark:text-neutral-400"
                  )}
                >
                  All
                </a>
                {legacyCategories.map((cat) => (
                  <a
                    key={cat.id}
                    href={buildShopHref({
                      category: cat.slug,
                      brand: brandParam || undefined,
                      sort: sort !== "featured" ? sort : undefined,
                    })}
                    className={cn(
                      "rounded-full px-4 py-2 text-sm font-medium transition-all duration-300",
                      categoryParam === cat.slug
                        ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                        : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-900 dark:text-neutral-400"
                    )}
                  >
                    {cat.name}
                  </a>
                ))}
              </>
            ) : null}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 rounded-full border border-neutral-200 px-4 py-2 text-sm md:hidden dark:border-neutral-800"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Sort
            </button>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className={cn(
                "rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm focus:border-primary focus:outline-none dark:border-neutral-800 dark:bg-neutral-950",
                showFilters ? "block" : "hidden md:block"
              )}
            >
              <option value="featured">Featured</option>
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {products.length > 0 ? (
          <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
            {products.map((product, i) => (
              <li key={product.id}>
                <ProductCard product={product} index={i} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="py-20 text-center">
            <p className="text-neutral-500">No products found.</p>
          </div>
        )}
      </div>
    </PageTransition>
  );
}

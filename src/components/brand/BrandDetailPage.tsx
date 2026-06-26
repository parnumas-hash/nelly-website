"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo } from "react";
import PageTransition from "@/components/ui/PageTransition";
import ProductCard from "@/components/product/ProductCard";
import CategoryCard from "@/components/brand/CategoryCard";
import { useCatalog } from "@/context/CatalogContext";
import {
  filterCategoriesForPetType,
  getBrandBySlug,
} from "@/lib/brand-categories";
import { getAvailableShopCategoriesForBrand } from "@/lib/shop-filters";
import {
  BRAND_PLACEHOLDER,
  getBrandDisplayImage,
  shouldUnoptimize,
} from "@/lib/image-utils";
import { AdminBrand } from "@/types";

interface BrandDetailPageProps {
  slug: string;
  initialBrand?: AdminBrand;
}

function CategorySection({
  title,
  categories,
  brandSlug,
  petType,
}: {
  title: string;
  categories: ReturnType<typeof filterCategoriesForPetType>;
  brandSlug: string;
  petType: "dog" | "cat";
}) {
  if (categories.length === 0) return null;

  return (
    <section className="mt-14">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-primary">
            {title}
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-neutral-900 dark:text-white">
            Shop {title}
          </h2>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
        {categories.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            brandSlug={brandSlug}
            petType={petType}
          />
        ))}
      </div>
    </section>
  );
}

export default function BrandDetailPage({
  slug,
  initialBrand,
}: BrandDetailPageProps) {
  const {
    brands,
    categories,
    publishedProducts,
    ready,
    getBrandBySlug: getBrand,
    filterProducts,
  } = useCatalog();
  const brand =
    (ready ? getBrand(slug) ?? getBrandBySlug(brands, slug) : undefined) ??
    initialBrand;

  const products = useMemo(
    () =>
      ready && brand
        ? filterProducts({ brand: brand.slug, sort: "featured" })
        : [],
    [ready, brand, filterProducts]
  );

  if (!ready && !initialBrand) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-neutral-400">
        Loading...
      </div>
    );
  }

  if (!brand || !brand.active) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center md:px-6">
        <p className="text-neutral-500">Brand not found.</p>
        <Link href="/shop" className="mt-4 inline-block text-primary hover:underline">
          Browse all products
        </Link>
      </div>
    );
  }

  const imageSrc = getBrandDisplayImage(brand);
  const dogCategories = filterCategoriesForPetType(
    getAvailableShopCategoriesForBrand(publishedProducts, categories, brand, "dog"),
    "dog"
  );
  const catCategories = filterCategoriesForPetType(
    getAvailableShopCategoriesForBrand(publishedProducts, categories, brand, "cat"),
    "cat"
  );
  const hasCategories = dogCategories.length > 0 || catCategories.length > 0;

  return (
    <PageTransition>
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
        <section className="overflow-hidden rounded-3xl bg-neutral-50 ring-1 ring-neutral-100 dark:bg-neutral-900/40 dark:ring-neutral-800">
          <div className="grid gap-8 md:grid-cols-[280px_1fr] md:items-center md:gap-12 md:p-10 p-6">
            <div className="relative mx-auto aspect-square w-full max-w-[280px] overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-neutral-900">
              {imageSrc ? (
                <Image
                  src={imageSrc}
                  alt={brand.displayName}
                  fill
                  className="object-contain p-6"
                  unoptimized={shouldUnoptimize(imageSrc)}
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-neutral-50 dark:bg-neutral-800/80">
                  <Image
                    src={BRAND_PLACEHOLDER}
                    alt=""
                    fill
                    className="object-cover opacity-50"
                    aria-hidden
                  />
                  <span className="relative z-10 text-4xl font-display font-semibold text-neutral-300">
                    {brand.displayName.charAt(0)}
                  </span>
                </div>
              )}
            </div>

            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-primary">
                Brand
              </p>
              <h1 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-5xl">
                {brand.displayName}
              </h1>
              <p className="mt-3 text-lg text-neutral-600 dark:text-neutral-300">
                {brand.tagline}
              </p>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-neutral-500">
                {brand.description}
              </p>
              <Link
                href={`/shop?brand=${brand.slug}`}
                className="mt-6 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-primary/90"
              >
                Shop All Products
              </Link>
            </div>
          </div>
        </section>

        {!hasCategories ? null : (
          <>
            <CategorySection
              title="Dog"
              categories={dogCategories}
              brandSlug={brand.slug}
              petType="dog"
            />
            <CategorySection
              title="Cat"
              categories={catCategories}
              brandSlug={brand.slug}
              petType="cat"
            />
          </>
        )}

        <section className="mt-14">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-primary">
                Collection
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-neutral-900 dark:text-white">
                All Products
              </h2>
            </div>
            <Link
              href={`/shop?brand=${brand.slug}`}
              className="text-sm font-medium text-primary hover:underline"
            >
              View in shop
            </Link>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
              {products.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-neutral-200 px-6 py-16 text-center dark:border-neutral-800">
              <p className="text-neutral-500">No products available for this brand yet.</p>
            </div>
          )}
        </section>
      </div>
    </PageTransition>
  );
}

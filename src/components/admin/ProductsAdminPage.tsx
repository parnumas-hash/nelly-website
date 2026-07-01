"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FileSpreadsheet, Plus, Pencil, Search, Trash2, Upload, X } from "lucide-react";
import Button from "@/components/ui/Button";
import SafeImage from "@/components/ui/SafeImage";
import ProductImportDialog from "@/components/admin/ProductImportDialog";
import { useCatalog } from "@/context/CatalogContext";
import { useAdminSession } from "@/context/AdminSessionContext";
import { downloadProductImportTemplate } from "@/lib/admin/product-import";
import { getBrandById } from "@/lib/brand-categories";
import { getSeedImagesForProduct } from "@/lib/image-utils";
import {
  getProductPrimarySku,
  getProductPriceRange,
  getProductTotalStock,
} from "@/lib/variants";
import { AdminBrand } from "@/types";
import { brandToSlug, cn, formatPrice } from "@/lib/utils";

function productMatchesBrand(
  brandId: string,
  product: { brandId: string; brand: string },
  brands: AdminBrand[]
) {
  if (product.brandId === brandId) return true;
  const brand = getBrandById(brands, brandId);
  if (!brand) return false;
  return brandToSlug(product.brand) === brand.slug || product.brand === brand.name;
}

export default function ProductsAdminPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const brandParam = searchParams.get("brand") || "";
  const queryParam = searchParams.get("q") || "";

  const { adminProducts, brands, categories, deleteProduct, ready } = useCatalog();
  const { hasPermission } = useAdminSession();
  const canWriteProducts = hasPermission("products:write");
  const [searchInput, setSearchInput] = useState(queryParam);
  const [importOpen, setImportOpen] = useState(false);

  const brandOptions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const product of adminProducts) {
      const brand =
        getBrandById(brands, product.brandId) ??
        brands.find(
          (item) =>
            item.name === product.brand ||
            item.displayName === product.brand ||
            brandToSlug(product.brand) === item.slug
        );
      if (!brand) continue;
      counts.set(brand.id, (counts.get(brand.id) ?? 0) + 1);
    }

    return brands
      .filter((brand) => counts.has(brand.id))
      .map((brand) => ({
        brand,
        count: counts.get(brand.id) ?? 0,
      }))
      .sort((a, b) => a.brand.displayName.localeCompare(b.brand.displayName));
  }, [adminProducts, brands]);

  const filteredProducts = useMemo(() => {
    let result = adminProducts;

    if (brandParam) {
      result = result.filter((product) =>
        productMatchesBrand(brandParam, product, brands)
      );
    }

    if (queryParam.trim()) {
      const q = queryParam.trim().toLowerCase();
      result = result.filter((product) => {
        const sku = getProductPrimarySku(product.variants).toLowerCase();
        return (
          product.name.toLowerCase().includes(q) ||
          product.brand.toLowerCase().includes(q) ||
          sku.includes(q)
        );
      });
    }

    return result;
  }, [adminProducts, brandParam, queryParam, brands]);

  const updateFilters = (next: { brand?: string; q?: string }) => {
    const params = new URLSearchParams();
    const brand = next.brand ?? brandParam;
    const q = next.q ?? queryParam;

    if (brand) params.set("brand", brand);
    if (q.trim()) params.set("q", q.trim());

    const query = params.toString();
    router.replace(query ? `/admin/products?${query}` : "/admin/products");
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ q: searchInput });
  };

  if (!ready) {
    return <div className="py-20 text-center text-neutral-400">Loading...</div>;
  }

  const activeBrand = brandParam ? getBrandById(brands, brandParam) : undefined;
  const hasFilters = Boolean(brandParam || queryParam.trim());

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Products
          </h1>
          <p className="mt-1 text-neutral-500">
            {hasFilters
              ? `${filteredProducts.length} of ${adminProducts.length} products`
              : `${adminProducts.length} total`}
            {activeBrand ? ` · ${activeBrand.displayName}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {canWriteProducts ? (
            <>
              <Button
                type="button"
                variant="outline"
                className="gap-2"
                onClick={() => downloadProductImportTemplate(brands, categories)}
              >
                <FileSpreadsheet className="h-4 w-4" />
                Download Template
              </Button>
              <Button
                type="button"
                variant="outline"
                className="gap-2"
                onClick={() => setImportOpen(true)}
              >
                <Upload className="h-4 w-4" />
                Import Products
              </Button>
              <Link
                href={
                  brandParam
                    ? `/admin/products/new?brandId=${brandParam}`
                    : "/admin/products/new"
                }
              >
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Product
                </Button>
              </Link>
            </>
          ) : null}
        </div>
      </div>

      {canWriteProducts ? (
        <ProductImportDialog open={importOpen} onClose={() => setImportOpen(false)} />
      ) : null}

      <div className="mb-6 space-y-4">
        <form onSubmit={handleSearchSubmit} className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search name, SKU, or brand…"
            className="w-full rounded-xl border border-neutral-200 bg-white py-2.5 pl-10 pr-10 text-sm focus:border-primary focus:outline-none dark:border-neutral-800 dark:bg-neutral-950"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => {
                setSearchInput("");
                updateFilters({ q: "" });
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </form>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => updateFilters({ brand: "" })}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              !brandParam
                ? "border-primary bg-primary text-white"
                : "border-neutral-200 text-neutral-600 hover:border-neutral-400 dark:border-neutral-800 dark:text-neutral-400"
            )}
          >
            All Brands ({adminProducts.length})
          </button>
          {brandOptions.map(({ brand, count }) => (
            <button
              key={brand.id}
              type="button"
              onClick={() => updateFilters({ brand: brand.id })}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                brandParam === brand.id
                  ? "border-primary bg-primary text-white"
                  : "border-neutral-200 text-neutral-600 hover:border-neutral-400 dark:border-neutral-800 dark:text-neutral-400"
              )}
            >
              {brand.displayName} ({count})
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        {filteredProducts.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-neutral-500">No products match your filters.</p>
            {hasFilters && (
              <Button
                type="button"
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearchInput("");
                  router.replace("/admin/products");
                }}
              >
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="border-b border-neutral-200 bg-neutral-50 text-xs uppercase tracking-wider text-neutral-500 dark:border-neutral-800 dark:bg-neutral-950">
                <tr>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">SKU</th>
                  <th className="px-4 py-3">Variants</th>
                  <th className="px-4 py-3">Brand</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3">Status</th>
                  {canWriteProducts ? (
                    <th className="px-4 py-3 text-right">Actions</th>
                  ) : null}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {filteredProducts.map((product) => {
                  const thumb =
                    product.variants.find((v) => v.images?.[0])?.images[0] ??
                    getSeedImagesForProduct(product)[0];
                  const priceRange = getProductPriceRange(product.variants);
                  const totalStock = getProductTotalStock(product.variants);

                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-neutral-50 dark:hover:bg-neutral-950/50"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                            <SafeImage
                              src={thumb}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <span className="font-medium">{product.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-neutral-500">
                        {getProductPrimarySku(product.variants)}
                      </td>
                      <td className="px-4 py-3 text-neutral-500">
                        {product.variants.length}
                      </td>
                      <td className="px-4 py-3">{product.brand}</td>
                      <td className="px-4 py-3">
                        {priceRange.hasRange ? (
                          <span>
                            {formatPrice(priceRange.min)} –{" "}
                            {formatPrice(priceRange.max)}
                          </span>
                        ) : (
                          formatPrice(priceRange.min)
                        )}
                      </td>
                      <td className="px-4 py-3">{totalStock}</td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            product.status === "published"
                              ? "rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700"
                              : "rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-600"
                          }
                        >
                          {product.status}
                        </span>
                      </td>
                      {canWriteProducts ? (
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <Link
                              href={`/admin/products/${product.id}/edit`}
                              className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
                            >
                              <Pencil className="h-4 w-4" />
                            </Link>
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Delete "${product.name}"?`)) {
                                  deleteProduct(product.id);
                                }
                              }}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      ) : null}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

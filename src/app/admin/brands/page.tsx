"use client";

import BrandEditorCard from "@/components/admin/BrandEditorCard";
import BrandAddForm from "@/components/admin/BrandAddForm";
import Link from "next/link";
import { useCatalog } from "@/context/CatalogContext";

export default function AdminBrandsPage() {
  const { brands, ready } = useCatalog();

  if (!ready) {
    return <div className="py-20 text-center text-neutral-400">Loading...</div>;
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="mb-2 text-2xl font-bold tracking-tight md:text-3xl">
            Brands
          </h1>
          <p className="max-w-2xl text-neutral-500">
            Manage partner brands shown on the storefront. Upload a brand image,
            edit details, then save each card. Product categories are managed
            separately in{" "}
            <Link
              href="/admin/categories"
              className="font-medium text-primary hover:underline"
            >
              Categories
            </Link>
            .
          </p>
        </div>
        <BrandAddForm />
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {brands.map((brand) => (
          <BrandEditorCard key={brand.id} brand={brand} />
        ))}
      </div>
    </div>
  );
}

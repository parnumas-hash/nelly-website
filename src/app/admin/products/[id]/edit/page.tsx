"use client";

import { use } from "react";
import ProductForm from "@/components/admin/ProductForm";
import ProductVariants from "@/components/admin/ProductVariants";
import { useCatalog } from "@/context/CatalogContext";
import Link from "next/link";

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { getAdminProduct, ready } = useCatalog();
  const product = getAdminProduct(id);

  if (!ready) {
    return <div className="py-20 text-center text-neutral-400">Loading...</div>;
  }

  if (!product) {
    return (
      <div className="py-20 text-center">
        <p className="text-neutral-500">Product not found.</p>
        <Link href="/admin/products" className="mt-4 inline-block text-primary">
          Back to products
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold tracking-tight md:text-3xl">
        Edit Product
      </h1>
      <p className="mb-8 text-neutral-500">{product.name}</p>
      <div className="max-w-4xl rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900 md:p-8">
        <ProductForm mode="edit" initial={product} />
        <ProductVariants product={product} />
      </div>
    </div>
  );
}

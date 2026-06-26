"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import PageTransition from "@/components/ui/PageTransition";
import ProductCard from "@/components/product/ProductCard";
import { useCatalog } from "@/context/CatalogContext";

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const { searchProducts, ready } = useCatalog();
  const results = ready && query ? searchProducts(query) : [];

  return (
    <PageTransition>
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
        <div className="mb-10">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.3em] text-primary">
            Search
          </p>
          <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
            {query ? `Results for "${query}"` : "Search"}
          </h1>
          {query && (
            <p className="mt-3 text-neutral-500">
              {results.length} {results.length === 1 ? "result" : "results"} found
            </p>
          )}
        </div>

        {results.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
            {results.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        ) : query ? (
          <div className="py-20 text-center">
            <p className="text-neutral-500">
              No products found for &ldquo;{query}&rdquo;
            </p>
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="text-neutral-500">
              Enter a search term using the search icon in the header.
            </p>
          </div>
        )}
      </div>
    </PageTransition>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[50vh] items-center justify-center">Loading...</div>}>
      <SearchContent />
    </Suspense>
  );
}

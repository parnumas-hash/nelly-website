"use client";

import { useMemo } from "react";
import PageTransition from "@/components/ui/PageTransition";
import ProductCard from "@/components/product/ProductCard";
import { useCatalog } from "@/context/CatalogContext";
import { Product } from "@/types";

interface SearchClientProps {
  initialProducts: Product[];
  query: string;
}

export default function SearchClient({
  initialProducts,
  query,
}: SearchClientProps) {
  const { searchProducts, ready } = useCatalog();

  const results = useMemo(() => {
    if (!query) return [];
    if (ready) return searchProducts(query);
    return initialProducts;
  }, [query, ready, searchProducts, initialProducts]);

  const resultCount = query ? results.length : 0;

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
              {resultCount} {resultCount === 1 ? "result" : "results"} found
            </p>
          )}
        </div>

        {results.length > 0 ? (
          <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
            {results.map((product, i) => (
              <li key={product.id}>
                <ProductCard product={product} index={i} />
              </li>
            ))}
          </ul>
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

        {query && results.length > 0 && !ready && (
          <p className="sr-only">
            {results.map((product) => product.name).join(", ")}
          </p>
        )}
      </div>
    </PageTransition>
  );
}

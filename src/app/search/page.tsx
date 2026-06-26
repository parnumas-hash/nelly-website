import { Suspense } from "react";
import SearchClient from "@/components/search/SearchClient";
import { getServerShopListing } from "@/lib/catalog/server-catalog";

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";

  const { products } = query
    ? await getServerShopListing({ query, sort: "featured" })
    : { products: [] };

  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          Loading...
        </div>
      }
    >
      <SearchClient initialProducts={products} query={query} />
    </Suspense>
  );
}

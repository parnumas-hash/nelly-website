import { Suspense } from "react";
import ShopClient from "@/components/shop/ShopClient";
import { getServerShopListing } from "@/lib/catalog/server-catalog";
import { ProductPetType, SortOption } from "@/types";

interface ShopPageProps {
  searchParams: Promise<{
    category?: string;
    brand?: string;
    petType?: string;
    sort?: string;
  }>;
}

function parseSort(value?: string): SortOption {
  if (
    value === "newest" ||
    value === "price-asc" ||
    value === "price-desc" ||
    value === "featured"
  ) {
    return value;
  }
  return "featured";
}

function parsePetType(value?: string): ProductPetType | undefined {
  if (value === "dog" || value === "cat") return value;
  return undefined;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const sort = parseSort(params.sort);
  const petType = parsePetType(params.petType);

  const { products, brands, categories } = await getServerShopListing({
    brand: params.brand,
    category: params.category,
    petType,
    sort,
  });

  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          Loading...
        </div>
      }
    >
      <ShopClient
        initialProducts={products}
        initialBrands={brands}
        initialCategories={categories}
        initialSort={sort}
      />
    </Suspense>
  );
}

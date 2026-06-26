import { normalizeCatalogSnapshot } from "@/lib/admin/catalog-normalize";
import { adminToStorefront } from "@/lib/admin/storage";
import { enrichProductWithMedia } from "@/lib/media-library";
import { getSeedImagesForProduct } from "@/lib/image-utils";
import {
  getDefaultCatalogSnapshot,
  loadCatalogFromDb,
} from "@/lib/supabase/catalog-store";
import { isSupabaseConfigured } from "@/lib/supabase/admin";
import { AdminBrand, BrandCategory, Product, ProductFilters } from "@/types";
import { sortBrandsAlphabetically } from "@/lib/brand-categories";
import { CatalogSyncSnapshot } from "@/lib/admin/catalog-sync";
import { filterPublishedProducts } from "@/lib/catalog/filter-products";

export async function getServerCatalogSnapshot(): Promise<CatalogSyncSnapshot> {
  if (isSupabaseConfigured()) {
    try {
      const snapshot = await loadCatalogFromDb();
      return normalizeCatalogSnapshot(snapshot);
    } catch {
      return normalizeCatalogSnapshot(null);
    }
  }
  return getDefaultCatalogSnapshot();
}

export async function getServerPublishedProducts(): Promise<Product[]> {
  const catalog = await getServerCatalogSnapshot();
  const enriched = catalog.products
    .filter((product) => product.status === "published")
    .map((product) =>
      enrichProductWithMedia(
        product,
        catalog.media,
        getSeedImagesForProduct(product)
      )
    );

  return enriched.map((product) => adminToStorefront(product, catalog.media));
}

export async function getServerProductBySlug(
  slug: string
): Promise<Product | undefined> {
  const products = await getServerPublishedProducts();
  return products.find((product) => product.slug === slug);
}

export async function getServerBrandBySlug(
  slug: string
): Promise<AdminBrand | undefined> {
  const catalog = await getServerCatalogSnapshot();
  const brands = sortBrandsAlphabetically(catalog.brands);
  return brands.find((brand) => brand.slug === slug && brand.active);
}

export async function getServerActiveBrands(): Promise<AdminBrand[]> {
  const catalog = await getServerCatalogSnapshot();
  return sortBrandsAlphabetically(catalog.brands).filter(
    (brand) => brand.active
  );
}

export async function getServerShopListing(
  filters: ProductFilters = {}
): Promise<{
  products: Product[];
  brands: AdminBrand[];
  categories: BrandCategory[];
}> {
  const catalog = await getServerCatalogSnapshot();
  const products = await getServerPublishedProducts();
  const brands = await getServerActiveBrands();
  const filtered = filterPublishedProducts(
    products,
    brands,
    catalog.categories,
    filters
  );

  return {
    products: filtered,
    brands,
    categories: catalog.categories,
  };
}

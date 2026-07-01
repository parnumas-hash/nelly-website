import { Product } from "@/types";

export const HOMEPAGE_PRODUCT_GRID_LIMIT = 4;

export function normalizeHomepageProductIds(
  value: unknown,
  max = HOMEPAGE_PRODUCT_GRID_LIMIT
): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((id): id is string => typeof id === "string")
    .map((id) => id.trim())
    .filter(Boolean)
    .slice(0, max);
}

export function resolveProductsByIds(
  publishedProducts: Product[],
  productIds?: string[],
  max = HOMEPAGE_PRODUCT_GRID_LIMIT
): Product[] {
  const ids = normalizeHomepageProductIds(productIds, max);
  if (ids.length === 0) return [];

  const byId = new Map(publishedProducts.map((product) => [product.id, product]));
  return ids
    .map((id) => byId.get(id))
    .filter((product): product is Product => Boolean(product));
}

export function resolveNewCollectionProducts(
  publishedProducts: Product[],
  productIds?: string[]
): Product[] {
  const manual = resolveProductsByIds(publishedProducts, productIds);
  if (manual.length > 0) return manual;

  const arrivals = publishedProducts.filter((product) => product.isNew);
  return arrivals.length > 0
    ? arrivals.slice(0, HOMEPAGE_PRODUCT_GRID_LIMIT)
    : publishedProducts.slice(0, HOMEPAGE_PRODUCT_GRID_LIMIT);
}

export function resolveBestSellerProducts(
  publishedProducts: Product[],
  productIds?: string[]
): Product[] {
  const manual = resolveProductsByIds(publishedProducts, productIds);
  if (manual.length > 0) return manual;

  const best = publishedProducts.filter((product) => product.bestSeller);
  return best.length > 0
    ? best.slice(0, HOMEPAGE_PRODUCT_GRID_LIMIT)
    : publishedProducts.slice(0, HOMEPAGE_PRODUCT_GRID_LIMIT);
}

export function resolveTravelCollectionProducts(
  publishedProducts: Product[],
  productIds?: string[]
): Product[] {
  const manual = resolveProductsByIds(publishedProducts, productIds);
  if (manual.length > 0) return manual;

  return publishedProducts
    .filter((product) => ["strollers", "accessories"].includes(product.category))
    .slice(0, HOMEPAGE_PRODUCT_GRID_LIMIT);
}

export function resolveHomeLivingProducts(
  publishedProducts: Product[],
  productIds?: string[]
): Product[] {
  const manual = resolveProductsByIds(publishedProducts, productIds);
  if (manual.length > 0) return manual;

  return publishedProducts
    .filter((product) => product.category === "beds")
    .slice(0, HOMEPAGE_PRODUCT_GRID_LIMIT);
}

export function resolveEcoCollectionProducts(
  publishedProducts: Product[],
  productIds?: string[]
): Product[] {
  const manual = resolveProductsByIds(publishedProducts, productIds);
  if (manual.length > 0) return manual;

  return publishedProducts
    .filter(
      (product) =>
        product.category === "eco" ||
        product.brand === "Earth Rated" ||
        product.tags.includes("eco")
    )
    .slice(0, HOMEPAGE_PRODUCT_GRID_LIMIT);
}

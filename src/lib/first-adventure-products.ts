import { Product } from "@/types";

export const FIRST_ADVENTURE_STARTER_TAGS = new Set([
  "starter",
  "first-adventure",
  "essentials",
  "new-pawrent",
  "new",
]);

export function normalizeFirstAdventureProductIds(
  value: unknown
): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((id): id is string => typeof id === "string")
    .map((id) => id.trim())
    .filter(Boolean)
    .slice(0, 2);
}

export function resolveFirstAdventureProducts(
  publishedProducts: Product[],
  productIds?: string[]
): Product[] {
  const ids = normalizeFirstAdventureProductIds(productIds);
  if (ids.length > 0) {
    const byId = new Map(publishedProducts.map((product) => [product.id, product]));
    return ids
      .map((id) => byId.get(id))
      .filter((product): product is Product => Boolean(product));
  }

  const tagged = publishedProducts.filter(
    (product) =>
      product.isNew ||
      product.tags?.some((tag) =>
        FIRST_ADVENTURE_STARTER_TAGS.has(tag.toLowerCase())
      )
  );

  if (tagged.length > 0) return tagged;

  return publishedProducts.filter((product) => product.featured);
}

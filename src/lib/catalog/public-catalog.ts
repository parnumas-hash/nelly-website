import { normalizeCatalogSnapshot } from "@/lib/admin/catalog-normalize";
import { enrichProductWithMedia } from "@/lib/media-library";
import { getSeedImagesForProduct } from "@/lib/image-utils";
import { sortBrandsAlphabetically } from "@/lib/brand-categories";
import { CatalogSyncSnapshot } from "@/lib/admin/catalog-sync";
import { AdminProduct, ProductVariant } from "@/types";

function sanitizePublicVariant(variant: ProductVariant): ProductVariant {
  return {
    ...variant,
    barcode: "",
  };
}

function toPublicAdminProduct(
  product: AdminProduct,
  media: CatalogSyncSnapshot["media"]
): AdminProduct {
  const enriched = enrichProductWithMedia(
    product,
    media,
    getSeedImagesForProduct(product)
  );
  return {
    ...enriched,
    variants: enriched.variants.map(sanitizePublicVariant),
  };
}

export type PublicCatalogResponse =
  | CatalogSyncSnapshot
  | { empty: true; configured: boolean };

export function toPublicCatalogResponse(
  snapshot: CatalogSyncSnapshot | null
): PublicCatalogResponse {
  const normalized = normalizeCatalogSnapshot(snapshot);

  if (normalized.products.length === 0) {
    return { empty: true, configured: true };
  }

  const products = normalized.products
    .filter((product) => product.status === "published")
    .map((product) => toPublicAdminProduct(product, normalized.media));

  const brands = sortBrandsAlphabetically(normalized.brands).filter(
    (brand) => brand.active
  );

  return {
    catalogVersion: normalized.catalogVersion,
    products,
    brands,
    categories: normalized.categories,
    media: normalized.media,
    banner: normalized.banner,
  };
}

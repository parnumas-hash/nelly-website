import { AdminBrand, AdminProduct, ProductPetType } from "@/types";
import { getBrandById } from "@/lib/brand-categories";

export function normalizeProductPetType(
  value: unknown
): ProductPetType | undefined {
  return value === "dog" || value === "cat" ? value : undefined;
}

export function inferBrandId(
  product: Pick<AdminProduct, "brand" | "brandId">,
  brands: AdminBrand[]
): string {
  if (product.brandId) {
    return product.brandId;
  }

  const match = brands.find(
    (brand) =>
      brand.name === product.brand ||
      brand.displayName === product.brand
  );

  return match?.id ?? "";
}

export function repairProductTaxonomy(
  product: AdminProduct,
  brands: AdminBrand[]
): AdminProduct {
  const brandId = inferBrandId(product, brands);
  const brand = getBrandById(brands, brandId);

  return {
    ...product,
    brandId,
    brand: brand?.name ?? product.brand,
    petType: normalizeProductPetType(product.petType),
    categoryId: product.categoryId ?? "",
    subCategoryName: product.subCategoryName ?? "",
  };
}

export function repairProductsTaxonomy(
  products: AdminProduct[],
  brands: AdminBrand[]
): AdminProduct[] {
  return products.map((product) => repairProductTaxonomy(product, brands));
}


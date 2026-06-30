import { AdminBrand, BrandCategory, Product, ProductPetType } from "@/types";
import {
  filterCategoriesForPetType,
  getCategoryById,
  getCategoryBySlug,
  sortBrandsAlphabetically,
} from "@/lib/brand-categories";
import { categories as legacyCategories } from "@/lib/products";
import { brandToSlug } from "@/lib/utils";

function legacyCategoryMatches(
  categoryId: string,
  category: BrandCategory
): boolean {
  const legacy = legacyCategories.find(
    (item) => item.id === categoryId || item.slug === categoryId
  );
  if (!legacy) return false;
  return legacy.slug === category.slug || legacy.id === category.id;
}

/** Single source of truth: does this product belong in this category? */
export function productMatchesBrandCategory(
  product: Product,
  category: BrandCategory,
  categories: BrandCategory[] = []
): boolean {
  if (product.categoryId) {
    if (
      product.categoryId === category.id ||
      product.categoryId === category.slug
    ) {
      return true;
    }

    const resolved = getCategoryById(categories, product.categoryId);
    if (resolved) {
      return resolved.id === category.id;
    }

    return legacyCategoryMatches(product.categoryId, category);
  }

  if (!product.category || product.category === "all") return false;

  return (
    product.category === category.slug || product.category === category.id
  );
}

export function hasProductPetType(
  product: Pick<Product, "petType">
): product is Product & { petType: ProductPetType } {
  return product.petType === "dog" || product.petType === "cat";
}

/** All published products are shop-visible; pet type is optional. */
export function filterShopVisibleProducts(products: Product[]): Product[] {
  return products;
}

export function productMatchesPetTypeFilter(
  product: Pick<Product, "petType">,
  petType: ProductPetType
): boolean {
  return !product.petType || product.petType === petType;
}

export function productBelongsToBrand(
  product: Product,
  brand: AdminBrand
): boolean {
  return (
    product.brandId === brand.id ||
    brandToSlug(product.brand) === brand.slug
  );
}

export function productMatchesCategoryFilter(
  product: Product,
  categorySlug: string,
  categories: BrandCategory[] = []
): boolean {
  const category = getCategoryBySlug(categories, categorySlug);
  if (category) {
    return productMatchesBrandCategory(product, category, categories);
  }
  return product.category === categorySlug;
}

export function getBrandProductsForShop(
  products: Product[],
  brand: AdminBrand,
  petType?: ProductPetType
): Product[] {
  return filterShopVisibleProducts(products).filter((product) => {
    if (!productBelongsToBrand(product, brand)) return false;
    if (petType && !productMatchesPetTypeFilter(product, petType)) return false;
    return true;
  });
}

export function getAvailablePetTypesForBrand(
  products: Product[],
  brand: AdminBrand
): ProductPetType[] {
  const types = new Set<ProductPetType>();
  for (const product of getBrandProductsForShop(products, brand)) {
    if (hasProductPetType(product)) {
      types.add(product.petType);
    }
  }
  return (["dog", "cat"] as ProductPetType[]).filter((type) => types.has(type));
}

export function getAvailableBrandCategoriesForShop(
  products: Product[],
  allCategories: BrandCategory[],
  brand: AdminBrand,
  petType: ProductPetType
): BrandCategory[] {
  const candidates = filterCategoriesForPetType(allCategories, petType);
  const brandProducts = getBrandProductsForShop(products, brand, petType);

  return candidates.filter((category) =>
    brandProducts.some((product) =>
      productMatchesBrandCategory(product, category, allCategories)
    )
  );
}

export function getAvailableShopCategoriesForBrand(
  products: Product[],
  allCategories: BrandCategory[],
  brand: AdminBrand,
  petType?: ProductPetType
): BrandCategory[] {
  const brandProducts = getBrandProductsForShop(products, brand, petType);
  const activeCategories = allCategories.filter((category) => category.active);

  return activeCategories.filter((category) =>
    brandProducts.some((product) =>
      productMatchesBrandCategory(product, category, allCategories)
    )
  );
}

export function getAvailableLegacyCategoriesForShop(
  products: Product[],
  brands: AdminBrand[],
  brandSlug?: string
): Array<{ id: string; name: string; slug: string }> {
  let pool = filterShopVisibleProducts(products);

  if (brandSlug) {
    const brand = brands.find((item) => item.slug === brandSlug);
    if (brand) {
      pool = pool.filter((product) => productBelongsToBrand(product, brand));
    }
  }

  return legacyCategories
    .filter((category) => category.slug !== "all")
    .filter((category) => {
      const asBrandCategory: BrandCategory = {
        id: category.id,
        name: category.name,
        slug: category.slug,
        petType: "both",
        sortOrder: 0,
        active: true,
      };
      return pool.some((product) =>
        productMatchesBrandCategory(product, asBrandCategory, [])
      );
    });
}

export function getBrandsWithShopProducts(
  products: Product[],
  brands: AdminBrand[]
): AdminBrand[] {
  return sortBrandsAlphabetically(
    brands.filter(
      (brand) => brand.active && getBrandProductsForShop(products, brand).length > 0
    )
  );
}

import * as XLSX from "xlsx";
import {
  AdminBrand,
  AdminProduct,
  BrandCategory,
  ProductFormData,
  ProductPetType,
  ProductStatus,
  ProductVariant,
  VariantStatus,
} from "@/types";
import { categories as legacyCategories } from "@/lib/products";
import {
  getCategoryBySlug,
} from "@/lib/brand-categories";
import { generateId, generateSlug } from "@/lib/admin/storage";
import { slugify } from "@/lib/utils";
import { normalizeVariant } from "@/lib/variants";
import { PLACEHOLDER_IMAGE } from "@/lib/image-utils";

export type ProductImportMode = "create" | "upsert";

export type ImportIssueLevel = "error" | "warning";

export interface ProductImportIssue {
  row: number;
  field?: string;
  level: ImportIssueLevel;
  message: string;
}

export interface ProductImportPreviewRow {
  row: number;
  productName: string;
  brand: string;
  sku: string;
  price: number;
  stock: number;
  action: "create" | "update" | "skip";
}

export interface ParsedProductImport {
  groups: ProductImportGroup[];
  issues: ProductImportIssue[];
  preview: ProductImportPreviewRow[];
  stats: {
    rowCount: number;
    productCount: number;
    variantCount: number;
    errorCount: number;
    warningCount: number;
  };
}

export interface ProductImportGroup {
  groupKey: string;
  productData: ProductFormData;
  variants: ProductVariant[];
  existingProductId?: string;
}

interface RawImportRow {
  rowNumber: number;
  values: Record<string, string>;
}

const COLUMN_ALIASES: Record<string, string> = {
  product_key: "product_key",
  productkey: "product_key",
  product_name: "product_name",
  productname: "product_name",
  name: "product_name",
  slug: "slug",
  brand: "brand",
  pet_type: "pet_type",
  pettype: "pet_type",
  category: "category",
  sub_category: "sub_category",
  subcategory: "sub_category",
  description: "description",
  long_description: "long_description",
  longdescription: "long_description",
  status: "status",
  featured: "featured",
  is_new: "is_new",
  isnew: "is_new",
  best_seller: "best_seller",
  bestseller: "best_seller",
  tags: "tags",
  variant_color: "variant_color",
  color: "variant_color",
  variant_size: "variant_size",
  size: "variant_size",
  variant_scent: "variant_scent",
  scent: "variant_scent",
  sku: "sku",
  barcode: "barcode",
  price: "price",
  sale_price: "sale_price",
  saleprice: "sale_price",
  stock: "stock",
  variant_status: "variant_status",
  variantstatus: "variant_status",
  image_urls: "image_urls",
  imageurls: "image_urls",
  images: "image_urls",
};

const TEMPLATE_HEADERS = [
  "product_key",
  "product_name",
  "slug",
  "brand",
  "pet_type",
  "category",
  "sub_category",
  "description",
  "long_description",
  "status",
  "featured",
  "is_new",
  "best_seller",
  "tags",
  "variant_color",
  "variant_size",
  "variant_scent",
  "sku",
  "barcode",
  "price",
  "sale_price",
  "stock",
  "variant_status",
  "image_urls",
] as const;

function normalizeHeader(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
}

function cellString(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }
  return String(value).trim();
}

function parseYesNo(value: string, fallback = false): boolean {
  const v = value.trim().toLowerCase();
  if (!v) return fallback;
  return ["yes", "y", "true", "1"].includes(v);
}

function parsePetType(value: string): ProductPetType | "" {
  const v = value.trim().toLowerCase();
  if (v === "dog" || v === "cat") return v;
  return "";
}

function parseStatus(value: string): ProductStatus {
  return value.trim().toLowerCase() === "draft" ? "draft" : "published";
}

function parseVariantStatus(value: string, stock: number): VariantStatus {
  const v = value.trim().toLowerCase();
  if (v === "out-of-stock" || v === "out_of_stock" || v === "outofstock") {
    return "out-of-stock";
  }
  if (v === "available") return "available";
  return stock > 0 ? "available" : "out-of-stock";
}

function parseNumber(value: string, field: string, row: number, issues: ProductImportIssue[]): number | null {
  const trimmed = value.replace(/,/g, "").replace(/฿/g, "").trim();
  if (!trimmed) return null;
  const num = Number(trimmed);
  if (!Number.isFinite(num)) {
    issues.push({
      row,
      field,
      level: "error",
      message: `Invalid number for ${field}.`,
    });
    return null;
  }
  return num;
}

export function parseImageUrls(value: string): string[] {
  if (!value.trim()) return [];
  return value
    .split("|")
    .map((part) => part.trim())
    .filter(Boolean);
}

function resolveBrand(
  brands: AdminBrand[],
  brandInput: string
): AdminBrand | undefined {
  const value = brandInput.trim().toLowerCase();
  if (!value) return undefined;
  return brands.find(
    (brand) =>
      brand.displayName.toLowerCase() === value ||
      brand.name.toLowerCase() === value ||
      brand.slug.toLowerCase() === value
  );
}

function resolveCategoryFields(
  categories: BrandCategory[],
  categoryInput: string
): { categoryId: string; category: string } {
  const value = categoryInput.trim();
  if (!value) {
    return { categoryId: "accessories", category: "accessories" };
  }

  const bySlug =
    getCategoryBySlug(categories, slugify(value)) ??
    getCategoryBySlug(categories, value.toLowerCase());
  if (bySlug) {
    return { categoryId: bySlug.id, category: bySlug.slug };
  }

  const legacy = legacyCategories.find(
    (item) =>
      item.id.toLowerCase() === value.toLowerCase() ||
      item.slug.toLowerCase() === value.toLowerCase() ||
      item.name.toLowerCase() === value.toLowerCase()
  );
  if (legacy) {
    return { categoryId: legacy.id, category: legacy.slug };
  }

  return { categoryId: slugify(value), category: slugify(value) };
}

function findProductBySku(
  products: AdminProduct[],
  sku: string
): { product: AdminProduct; variant: ProductVariant } | undefined {
  const normalized = sku.trim().toLowerCase();
  for (const product of products) {
    for (const variant of product.variants ?? []) {
      if (variant.sku.trim().toLowerCase() === normalized) {
        return { product, variant };
      }
    }
  }
  return undefined;
}

function groupKeyForRow(row: RawImportRow): string {
  const key = row.values.product_key?.trim();
  if (key) return key.toLowerCase();
  const brand = row.values.brand?.trim().toLowerCase() ?? "";
  const name = row.values.product_name?.trim().toLowerCase() ?? "";
  return `${brand}::${name}`;
}

function readSheetRows(buffer: ArrayBuffer): RawImportRow[] {
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheetName =
    workbook.SheetNames.find((name) =>
      name.toLowerCase().includes("products_import")
    ) ?? workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) return [];

  const matrix = XLSX.utils.sheet_to_json<(string | number | null)[]>(sheet, {
    header: 1,
    defval: "",
    raw: false,
  }) as (string | number | null)[][];

  if (matrix.length < 2) return [];

  const headerRow = matrix[0] ?? [];
  const columnKeys = headerRow.map((cell) => {
    const normalized = normalizeHeader(cell);
    return COLUMN_ALIASES[normalized] ?? normalized;
  });

  const rows: RawImportRow[] = [];
  for (let i = 1; i < matrix.length; i += 1) {
    const line = matrix[i] ?? [];
    const values: Record<string, string> = {};
    let hasContent = false;

    columnKeys.forEach((key, index) => {
      if (!key) return;
      const text = cellString(line[index]);
      if (text) hasContent = true;
      values[key] = text;
    });

    if (!hasContent) continue;
    rows.push({ rowNumber: i + 1, values });
  }

  return rows;
}

export function parseProductImportWorkbook(
  buffer: ArrayBuffer,
  options: {
    brands: AdminBrand[];
    categories: BrandCategory[];
    products: AdminProduct[];
    mode: ProductImportMode;
  }
): ParsedProductImport {
  const issues: ProductImportIssue[] = [];
  const rawRows = readSheetRows(buffer);

  if (rawRows.length === 0) {
    issues.push({
      row: 0,
      level: "error",
      message: "No product rows found. Use the products_import sheet.",
    });
    return {
      groups: [],
      issues,
      preview: [],
      stats: {
        rowCount: 0,
        productCount: 0,
        variantCount: 0,
        errorCount: 1,
        warningCount: 0,
      },
    };
  }

  const skuInFile = new Map<string, number>();
  const grouped = new Map<string, RawImportRow[]>();

  for (const row of rawRows) {
    const sku = row.values.sku?.trim();
    const name = row.values.product_name?.trim();
    const brand = row.values.brand?.trim();

    if (!name) {
      issues.push({
        row: row.rowNumber,
        field: "product_name",
        level: "error",
        message: "Product name is required.",
      });
    }
    if (!brand) {
      issues.push({
        row: row.rowNumber,
        field: "brand",
        level: "error",
        message: "Brand is required.",
      });
    }
    if (!sku) {
      issues.push({
        row: row.rowNumber,
        field: "sku",
        level: "error",
        message: "SKU is required.",
      });
    } else {
      const prior = skuInFile.get(sku.toLowerCase());
      if (prior) {
        issues.push({
          row: row.rowNumber,
          field: "sku",
          level: "error",
          message: `Duplicate SKU in file (also on row ${prior}).`,
        });
      } else {
        skuInFile.set(sku.toLowerCase(), row.rowNumber);
      }
    }

    if (brand && !resolveBrand(options.brands, brand)) {
      issues.push({
        row: row.rowNumber,
        field: "brand",
        level: "error",
        message: `Unknown brand "${brand}".`,
      });
    }

    const key = groupKeyForRow(row);
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(row);
  }

  const groups: ProductImportGroup[] = [];
  const preview: ProductImportPreviewRow[] = [];

  for (const [groupKey, rows] of grouped.entries()) {
    const first = rows[0];
    const brand = resolveBrand(options.brands, first.values.brand ?? "");
    if (!brand) continue;

    const productName = first.values.product_name?.trim() ?? "";
    const mismatchedName = rows.find(
      (row) => (row.values.product_name?.trim() ?? "") !== productName
    );
    if (mismatchedName) {
      issues.push({
        row: mismatchedName.rowNumber,
        field: "product_name",
        level: "error",
        message: `Product name must match other rows in group "${groupKey}".`,
      });
    }

    const categoryFields = resolveCategoryFields(
      options.categories,
      first.values.category ?? ""
    );
    if (
      first.values.category?.trim() &&
      !getCategoryBySlug(options.categories, categoryFields.category) &&
      !legacyCategories.some(
        (item) =>
          item.slug === categoryFields.category ||
          item.id === categoryFields.category
      )
    ) {
      issues.push({
        row: first.rowNumber,
        field: "category",
        level: "warning",
        message: `Category "${first.values.category}" was not found. Using "${categoryFields.category}".`,
      });
    }

    const productData: ProductFormData = {
      name: productName,
      slug: first.values.slug?.trim() ?? "",
      brand: brand.displayName || brand.name,
      brandId: brand.id,
      petType: parsePetType(first.values.pet_type ?? ""),
      categoryId: categoryFields.categoryId,
      subCategoryName: first.values.sub_category?.trim() ?? "",
      category: categoryFields.category,
      description: first.values.description?.trim() ?? productName,
      longDescription:
        first.values.long_description?.trim() ||
        first.values.description?.trim() ||
        productName,
      status: parseStatus(first.values.status ?? ""),
      featured: parseYesNo(first.values.featured ?? ""),
      isNew: parseYesNo(first.values.is_new ?? ""),
      bestSeller: parseYesNo(first.values.best_seller ?? ""),
      tags: (first.values.tags ?? "")
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    };

    const variants: ProductVariant[] = [];
    let existingProductId: string | undefined;
    const matchedProductIds = new Set<string>();

    for (const row of rows) {
      const sku = row.values.sku?.trim() ?? "";
      const price = parseNumber(row.values.price ?? "", "price", row.rowNumber, issues);
      const stock = parseNumber(row.values.stock ?? "", "stock", row.rowNumber, issues);
      if (price == null || stock == null || !sku) continue;

      const saleRaw = row.values.sale_price?.trim();
      const salePrice =
        saleRaw != null && saleRaw !== ""
          ? parseNumber(saleRaw, "sale_price", row.rowNumber, issues)
          : null;

      const existingMatch = findProductBySku(options.products, sku);
      if (existingMatch) {
        matchedProductIds.add(existingMatch.product.id);
        existingProductId = existingMatch.product.id;
      }

      if (options.mode === "create" && existingMatch) {
        issues.push({
          row: row.rowNumber,
          field: "sku",
          level: "error",
          message: `SKU "${sku}" already exists in the catalog.`,
        });
      }

      const imageUrls = parseImageUrls(row.values.image_urls ?? "");
      if (!imageUrls.length) {
        issues.push({
          row: row.rowNumber,
          field: "image_urls",
          level: "warning",
          message: "No image URL provided. Placeholder will be used.",
        });
      }

      const variant = normalizeVariant({
        id: existingMatch?.variant.id ?? generateId(),
        color: row.values.variant_color?.trim() || "Default",
        size: row.values.variant_size?.trim() || "One Size",
        scent: row.values.variant_scent?.trim() || undefined,
        sku,
        barcode: row.values.barcode?.trim() || sku,
        price,
        salePrice: salePrice && salePrice > 0 ? salePrice : undefined,
        stock,
        imageIds: existingMatch?.variant.imageIds ?? [],
        images:
          imageUrls.length > 0
            ? imageUrls
            : existingMatch?.variant.images?.length
              ? existingMatch.variant.images
              : [PLACEHOLDER_IMAGE],
        status: parseVariantStatus(row.values.variant_status ?? "", stock),
      });

      variants.push(variant);

      preview.push({
        row: row.rowNumber,
        productName,
        brand: productData.brand,
        sku,
        price,
        stock,
        action: existingMatch ? "update" : "create",
      });
    }

    if (matchedProductIds.size > 1) {
      issues.push({
        row: first.rowNumber,
        level: "error",
        message: `Variants in group "${groupKey}" match multiple existing products.`,
      });
    }

    if (variants.length > 0) {
      groups.push({
        groupKey,
        productData,
        variants,
        existingProductId,
      });
    }
  }

  const errorCount = issues.filter((issue) => issue.level === "error").length;
  const warningCount = issues.filter((issue) => issue.level === "warning").length;

  return {
    groups,
    issues,
    preview,
    stats: {
      rowCount: rawRows.length,
      productCount: groups.length,
      variantCount: preview.length,
      errorCount,
      warningCount,
    },
  };
}

export function applyProductImportGroups(
  products: AdminProduct[],
  groups: ProductImportGroup[],
  mode: ProductImportMode
): { nextProducts: AdminProduct[]; created: number; updated: number } {
  let next = [...products];
  let created = 0;
  let updated = 0;

  for (const group of groups) {
    const slugs = next.map((product) => product.slug);
    const slug =
      group.productData.slug.trim() !== ""
        ? generateSlug(group.productData.slug.trim(), slugs)
        : generateSlug(group.productData.name, slugs);

    if (mode === "upsert" && group.existingProductId) {
      next = next.map((product) => {
        if (product.id !== group.existingProductId) return product;
        updated += 1;

        const mergedVariants = [...product.variants];
        for (const imported of group.variants) {
          const index = mergedVariants.findIndex(
            (variant) =>
              variant.sku.trim().toLowerCase() === imported.sku.trim().toLowerCase()
          );
          if (index >= 0) mergedVariants[index] = imported;
          else mergedVariants.push(imported);
        }

        return {
          ...product,
          name: group.productData.name,
          brand: group.productData.brand,
          brandId: group.productData.brandId,
          petType:
            group.productData.petType === "dog" ||
            group.productData.petType === "cat"
              ? group.productData.petType
              : undefined,
          categoryId: group.productData.categoryId,
          subCategoryName: group.productData.subCategoryName || undefined,
          category: group.productData.category,
          description: group.productData.description,
          longDescription: group.productData.longDescription,
          status: group.productData.status,
          featured: group.productData.featured,
          isNew: group.productData.isNew,
          bestSeller: group.productData.bestSeller,
          tags: group.productData.tags,
          variants: mergedVariants,
          updatedAt: new Date().toISOString(),
        };
      });
      continue;
    }

    const newProduct: AdminProduct = {
      id: generateId(),
      slug,
      name: group.productData.name,
      brand: group.productData.brand,
      brandId: group.productData.brandId,
      petType:
        group.productData.petType === "dog" ||
        group.productData.petType === "cat"
          ? group.productData.petType
          : undefined,
      categoryId: group.productData.categoryId,
      subCategoryName: group.productData.subCategoryName || undefined,
      category: group.productData.category,
      description: group.productData.description,
      longDescription: group.productData.longDescription,
      variants: group.variants,
      status: group.productData.status,
      featured: group.productData.featured,
      isNew: group.productData.isNew,
      bestSeller: group.productData.bestSeller,
      rating: 4.8,
      reviewCount: 0,
      tags: group.productData.tags,
      updatedAt: new Date().toISOString(),
    };

    next = [newProduct, ...next];
    created += 1;
  }

  return { nextProducts: next, created, updated };
}

export function downloadProductImportTemplate(
  brands: AdminBrand[],
  categories: BrandCategory[]
): void {
  const examples = [
    {
      product_key: "PUZZLE-001",
      product_name: "Interactive Puzzle Feeder",
      slug: "interactive-puzzle-feeder",
      brand: brands[0]?.displayName ?? "AIRBUGGY PET",
      pet_type: "dog",
      category: "accessories",
      sub_category: "",
      description: "Short description for the product card.",
      long_description: "Longer product description for the detail page.",
      status: "published",
      featured: "no",
      is_new: "yes",
      best_seller: "no",
      tags: "toys,interactive",
      variant_color: "Default",
      variant_size: "One Size",
      variant_scent: "",
      sku: "ADLI0166",
      barcode: "ADLI0166",
      price: 890,
      sale_price: "",
      stock: 7,
      variant_status: "available",
      image_urls: "https://example.com/puzzle.jpg",
    },
    {
      product_key: "AIRBUGGY-DOME3",
      product_name: "NH X AIRBUGGY DOME3",
      slug: "nh-x-airbuggy-dome3",
      brand: brands[0]?.displayName ?? "AIRBUGGY PET",
      pet_type: "dog",
      category: "strollers",
      sub_category: "",
      description: "Premium pet stroller.",
      long_description: "Premium pet stroller with full detail copy.",
      status: "published",
      featured: "yes",
      is_new: "no",
      best_seller: "yes",
      tags: "travel,premium",
      variant_color: "Black",
      variant_size: "Standard",
      variant_scent: "",
      sku: "4580445434005",
      barcode: "4580445434005",
      price: 26900,
      sale_price: "",
      stock: 2,
      variant_status: "available",
      image_urls: "https://example.com/dome3-black.jpg",
    },
    {
      product_key: "AIRBUGGY-DOME3",
      product_name: "NH X AIRBUGGY DOME3",
      slug: "nh-x-airbuggy-dome3",
      brand: brands[0]?.displayName ?? "AIRBUGGY PET",
      pet_type: "dog",
      category: "strollers",
      sub_category: "",
      description: "Premium pet stroller.",
      long_description: "Premium pet stroller with full detail copy.",
      status: "published",
      featured: "yes",
      is_new: "no",
      best_seller: "yes",
      tags: "travel,premium",
      variant_color: "Gray",
      variant_size: "Standard",
      variant_scent: "",
      sku: "4580445434006",
      barcode: "4580445434006",
      price: 26900,
      sale_price: 25500,
      stock: 1,
      variant_status: "available",
      image_urls: "https://example.com/dome3-gray.jpg",
    },
  ];

  const productsSheet = XLSX.utils.json_to_sheet(examples, {
    header: [...TEMPLATE_HEADERS],
  });
  const brandsSheet = XLSX.utils.json_to_sheet(
    brands.map((brand) => ({
      brand: brand.displayName,
      slug: brand.slug,
      active: brand.active ? "yes" : "no",
    }))
  );
  const categoriesSheet = XLSX.utils.json_to_sheet(
    (categories.length > 0
      ? categories.map((category) => ({
          category: category.name,
          slug: category.slug,
          pet_type: category.petType,
        }))
      : legacyCategories
          .filter((item) => item.id !== "all")
          .map((item) => ({
            category: item.name,
            slug: item.slug,
            pet_type: "both",
          }))
    )
  );
  const instructionsSheet = XLSX.utils.aoa_to_sheet([
    ["NELLY GROUP — Product Import Template"],
    [""],
    ["1 row = 1 variant. Repeat product fields for each variant in the same product."],
    ["Use product_key to group variants together."],
    ["Required: product_name, brand, sku, price, stock."],
    ["status: draft or published"],
    ["featured / is_new / best_seller: yes or no"],
    ["image_urls: separate multiple URLs with |"],
    ["Import modes: Create only, or Upsert by SKU."],
  ]);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, productsSheet, "products_import");
  XLSX.utils.book_append_sheet(workbook, brandsSheet, "brands_reference");
  XLSX.utils.book_append_sheet(workbook, categoriesSheet, "categories_reference");
  XLSX.utils.book_append_sheet(workbook, instructionsSheet, "instructions");
  XLSX.writeFile(workbook, "nelly-product-import-template.xlsx");
}

export function canConfirmProductImport(parsed: ParsedProductImport): boolean {
  return parsed.stats.errorCount === 0 && parsed.groups.length > 0;
}

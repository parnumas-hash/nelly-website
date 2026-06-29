import { ProductVariant, VariantFormData, VariantStatus } from "@/types";

export const MAX_VARIANT_IMAGES = 5;

export interface VariantMatrixRow {
  key: string;
  color: string;
  size: string;
  scent: string;
  existingId?: string;
  price: number;
  salePrice?: number;
  stock: number;
  sku: string;
  barcode: string;
  imageIds: string[];
  status: VariantStatus;
}

export interface VariantMatrixOptions {
  colors: string[];
  sizes: string[];
  scents: string[];
  useScent: boolean;
}

export function variantComboKey(
  color: string,
  size: string,
  scent = ""
): string {
  return `${color.trim()}|${size.trim()}|${scent.trim()}`;
}

export function slugToken(value: string): string {
  return value
    .trim()
    .toUpperCase()
    .replace(/[^\w]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function inferMatrixOptions(
  variants: ProductVariant[]
): VariantMatrixOptions {
  const colors = [...new Set(variants.map((v) => v.color.trim()).filter(Boolean))];
  const sizes = [...new Set(variants.map((v) => v.size.trim()).filter(Boolean))];
  const scents = [
    ...new Set(variants.map((v) => (v.scent ?? "").trim()).filter(Boolean)),
  ];

  return {
    colors,
    sizes,
    scents,
    useScent: scents.length > 0,
  };
}

export function generateMatrixCombinations(
  options: VariantMatrixOptions
): Array<Pick<VariantMatrixRow, "key" | "color" | "size" | "scent">> {
  const colors = options.colors.map((v) => v.trim()).filter(Boolean);
  const sizes = options.sizes.map((v) => v.trim()).filter(Boolean);
  const scents = options.useScent
    ? options.scents.map((v) => v.trim()).filter(Boolean)
    : [""];

  if (!colors.length || !sizes.length || (options.useScent && !scents.length)) {
    return [];
  }

  const rows: Array<Pick<VariantMatrixRow, "key" | "color" | "size" | "scent">> =
    [];

  for (const color of colors) {
    for (const size of sizes) {
      for (const scent of scents) {
        rows.push({
          color,
          size,
          scent,
          key: variantComboKey(color, size, scent),
        });
      }
    }
  }

  return rows;
}

export function buildMatrixRows(
  options: VariantMatrixOptions,
  existing: ProductVariant[],
  defaults?: Partial<
    Pick<VariantMatrixRow, "price" | "stock" | "sku" | "barcode" | "status">
  >
): VariantMatrixRow[] {
  const byKey = new Map(
    existing.map((v) => [variantComboKey(v.color, v.size, v.scent ?? ""), v])
  );

  return generateMatrixCombinations(options).map((combo) => {
    const match = byKey.get(combo.key);
    return {
      ...combo,
      existingId: match?.id,
      price: match?.price ?? defaults?.price ?? 0,
      salePrice: match?.salePrice,
      stock: match?.stock ?? defaults?.stock ?? 0,
      sku: match?.sku ?? defaults?.sku ?? "",
      barcode: match?.barcode ?? defaults?.barcode ?? "",
      imageIds: match?.imageIds ? [...match.imageIds] : [],
      status: match?.status ?? defaults?.status ?? "available",
    };
  });
}

export function suggestSku(
  prefix: string,
  color: string,
  size: string,
  scent: string
): string {
  const base = slugToken(prefix) || "SKU";
  const parts = [slugToken(color), slugToken(size)];
  if (scent.trim()) parts.push(slugToken(scent));
  return `${base}-${parts.filter(Boolean).join("-")}`;
}

export function matrixRowsToFormData(
  rows: VariantMatrixRow[]
): VariantFormData[] {
  return rows.map((row) => ({
    color: row.color,
    size: row.size,
    scent: row.scent,
    sku: row.sku,
    barcode: row.barcode,
    price: row.price,
    salePrice: row.salePrice,
    stock: row.stock,
    imageIds: row.imageIds.slice(0, MAX_VARIANT_IMAGES),
    status: row.status,
  }));
}

export function parseOptionInput(raw: string): string[] {
  return [
    ...new Set(
      raw
        .split(/[,，\n]+/)
        .map((part) => part.trim())
        .filter(Boolean)
    ),
  ];
}

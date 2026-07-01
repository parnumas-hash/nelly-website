import * as XLSX from "xlsx";
import { AdminProduct } from "@/types";

export interface StockImportIssue {
  row: number;
  level: "error" | "warning";
  message: string;
}

export interface StockImportRow {
  row: number;
  sku: string;
  stock: number;
}

export interface ParsedStockImport {
  rows: StockImportRow[];
  issues: StockImportIssue[];
}

function cellString(value: unknown): string {
  if (value == null) return "";
  return String(value).trim();
}

function parseStockNumber(
  value: string,
  row: number,
  issues: StockImportIssue[]
): number | null {
  if (!value) {
    issues.push({ row, level: "error", message: "Stock is required." });
    return null;
  }

  const num = Number(value.replace(/,/g, ""));
  if (!Number.isFinite(num) || num < 0) {
    issues.push({ row, level: "error", message: "Stock must be a non-negative number." });
    return null;
  }

  return Math.floor(num);
}

export function parseStockImportWorkbook(buffer: ArrayBuffer): ParsedStockImport {
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const issues: StockImportIssue[] = [];
  const rows: StockImportRow[] = [];

  if (!sheet) {
    return { rows, issues: [{ row: 0, level: "error", message: "Workbook is empty." }] };
  }

  const matrix = XLSX.utils.sheet_to_json<(string | number | null)[]>(sheet, {
    header: 1,
    defval: "",
    raw: false,
  }) as (string | number | null)[][];

  if (matrix.length < 2) {
    return {
      rows,
      issues: [{ row: 0, level: "error", message: "Add at least one data row." }],
    };
  }

  const header = (matrix[0] ?? []).map((cell) => cellString(cell).toLowerCase());
  const skuIndex = header.findIndex((cell) => cell === "sku" || cell === "barcode");
  const stockIndex = header.findIndex((cell) => cell === "stock" || cell === "quantity");

  if (skuIndex < 0 || stockIndex < 0) {
    return {
      rows,
      issues: [
        {
          row: 1,
          level: "error",
          message: 'Header row must include "sku" and "stock" columns.',
        },
      ],
    };
  }

  for (let i = 1; i < matrix.length; i += 1) {
    const line = matrix[i] ?? [];
    const sku = cellString(line[skuIndex]);
    const stockRaw = cellString(line[stockIndex]);
    if (!sku && !stockRaw) continue;

    const rowNumber = i + 1;
    if (!sku) {
      issues.push({ row: rowNumber, level: "error", message: "SKU is required." });
      continue;
    }

    const stock = parseStockNumber(stockRaw, rowNumber, issues);
    if (stock == null) continue;

    rows.push({ row: rowNumber, sku, stock });
  }

  return { rows, issues };
}

export function applyStockImport(
  products: AdminProduct[],
  rows: StockImportRow[]
): { nextProducts: AdminProduct[]; updated: number; skipped: number } {
  let updated = 0;
  let skipped = 0;

  const nextProducts = products.map((product) => {
    let productChanged = false;
    const nextVariants = (product.variants ?? []).map((variant) => {
      const match = rows.find(
        (row) => row.sku.trim().toLowerCase() === variant.sku.trim().toLowerCase()
      );
      if (!match) return variant;

      if (variant.stock === match.stock) {
        skipped += 1;
        return variant;
      }

      productChanged = true;
      updated += 1;
      return { ...variant, stock: match.stock };
    });

    if (!productChanged) return product;
    return {
      ...product,
      variants: nextVariants,
      updatedAt: new Date().toISOString(),
    };
  });

  return { nextProducts, updated, skipped };
}

export function canConfirmStockImport(parsed: ParsedStockImport): boolean {
  return (
    parsed.rows.length > 0 &&
    parsed.issues.every((issue) => issue.level !== "error")
  );
}

export function downloadStockImportTemplate(): void {
  const sheet = XLSX.utils.aoa_to_sheet([
    ["sku", "stock"],
    ["ADLI0166", 12],
    ["4580445434005", 3],
  ]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "stock_import");
  XLSX.writeFile(workbook, "nelly-stock-import-template.xlsx");
}

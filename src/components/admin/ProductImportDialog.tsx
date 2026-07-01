"use client";

import { useCallback, useRef, useState } from "react";
import { AlertTriangle, FileSpreadsheet, Upload, X } from "lucide-react";
import Button from "@/components/ui/Button";
import { useCatalog } from "@/context/CatalogContext";
import { useAdminSession } from "@/context/AdminSessionContext";
import {
  canConfirmProductImport,
  downloadProductImportTemplate,
  parseProductImportWorkbook,
  type ParsedProductImport,
  type ProductImportMode,
} from "@/lib/admin/product-import";
import { cn, formatPrice } from "@/lib/utils";

interface ProductImportDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function ProductImportDialog({
  open,
  onClose,
}: ProductImportDialogProps) {
  const { adminProducts, brands, categories, importProducts } = useCatalog();
  const { hasPermission } = useAdminSession();
  const canWriteProducts = hasPermission("products:write");
  const inputRef = useRef<HTMLInputElement>(null);
  const fileBufferRef = useRef<ArrayBuffer | null>(null);
  const [mode, setMode] = useState<ProductImportMode>("upsert");
  const [parsed, setParsed] = useState<ParsedProductImport | null>(null);
  const [fileName, setFileName] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ created: number; updated: number } | null>(
    null
  );
  const [parseError, setParseError] = useState<string | null>(null);

  const parseBuffer = useCallback(
    async (buffer: ArrayBuffer, importMode: ProductImportMode) => {
      setBusy(true);
      setParseError(null);
      setResult(null);

      try {
        const next = parseProductImportWorkbook(buffer, {
          brands,
          categories,
          products: adminProducts,
          mode: importMode,
        });
        setParsed(next);
      } catch (error) {
        setParsed(null);
        setParseError(
          error instanceof Error ? error.message : "Could not read the Excel file."
        );
      } finally {
        setBusy(false);
      }
    },
    [adminProducts, brands, categories]
  );

  if (!open) return null;

  const reset = () => {
    setParsed(null);
    setFileName("");
    setResult(null);
    setParseError(null);
    fileBufferRef.current = null;
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleDownloadTemplate = () => {
    downloadProductImportTemplate(brands, categories);
  };

  const handleFileChange = async (file: File | undefined) => {
    if (!file) return;

    const buffer = await file.arrayBuffer();
    fileBufferRef.current = buffer;
    setFileName(file.name);
    await parseBuffer(buffer, mode);
  };

  const handleModeChange = (nextMode: ProductImportMode) => {
    setMode(nextMode);
    if (fileBufferRef.current) {
      void parseBuffer(fileBufferRef.current, nextMode);
    }
  };

  const handleConfirm = () => {
    if (!canWriteProducts || !parsed || !canConfirmProductImport(parsed)) return;
    setBusy(true);
    try {
      const summary = importProducts(parsed.groups, mode);
      setResult(summary);
      setParsed(null);
      fileBufferRef.current = null;
    } finally {
      setBusy(false);
    }
  };

  const errors = parsed?.issues.filter((issue) => issue.level === "error") ?? [];
  const warnings = parsed?.issues.filter((issue) => issue.level === "warning") ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
        aria-hidden
      />
      <div className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xl dark:border-neutral-800 dark:bg-neutral-950">
        <div className="flex items-start justify-between border-b border-neutral-200 px-6 py-4 dark:border-neutral-800">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Import Products</h2>
            <p className="mt-1 text-sm text-neutral-500">
              Upload an Excel file using the NELLY template. One row equals one variant.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-900"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[calc(90vh-88px)] overflow-y-auto px-6 py-5">
          <div className="flex flex-wrap gap-3">
            <Button type="button" variant="outline" onClick={handleDownloadTemplate}>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Download Template
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
            >
              <Upload className="mr-2 h-4 w-4" />
              Choose Excel File
            </Button>
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={(e) => void handleFileChange(e.target.files?.[0])}
            />
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {(["upsert", "create"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => handleModeChange(option)}
                disabled={busy}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50",
                  mode === option
                    ? "bg-primary text-white"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-900 dark:text-neutral-300"
                )}
              >
                {option === "upsert" ? "Upsert by SKU" : "Create only"}
              </button>
            ))}
          </div>

          {fileName ? (
            <p className="mt-4 text-sm text-neutral-500">File: {fileName}</p>
          ) : null}

          {parseError ? (
            <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
              {parseError}
            </p>
          ) : null}

          {result ? (
            <div className="mt-5 rounded-xl border border-green-200 bg-green-50 px-4 py-4 text-sm text-green-800 dark:border-green-900 dark:bg-green-950/30 dark:text-green-300">
              Import complete — created {result.created} product(s), updated{" "}
              {result.updated} product(s).
            </div>
          ) : null}

          {parsed ? (
            <div className="mt-6 space-y-5">
              <div className="grid gap-3 sm:grid-cols-4">
                <Stat label="Rows" value={parsed.stats.rowCount} />
                <Stat label="Products" value={parsed.stats.productCount} />
                <Stat label="Errors" value={parsed.stats.errorCount} danger />
                <Stat label="Warnings" value={parsed.stats.warningCount} />
              </div>

              {errors.length > 0 ? (
                <IssueList title="Errors" items={errors} tone="error" />
              ) : null}

              {warnings.length > 0 ? (
                <IssueList title="Warnings" items={warnings} tone="warning" />
              ) : null}

              <div className="overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800">
                <div className="border-b border-neutral-200 bg-neutral-50 px-4 py-3 text-sm font-medium dark:border-neutral-800 dark:bg-neutral-900">
                  Preview
                </div>
                <div className="max-h-72 overflow-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="sticky top-0 bg-white dark:bg-neutral-950">
                      <tr className="border-b border-neutral-200 dark:border-neutral-800">
                        <th className="px-4 py-2 font-medium">Row</th>
                        <th className="px-4 py-2 font-medium">Product</th>
                        <th className="px-4 py-2 font-medium">Brand</th>
                        <th className="px-4 py-2 font-medium">SKU</th>
                        <th className="px-4 py-2 font-medium">Price</th>
                        <th className="px-4 py-2 font-medium">Stock</th>
                        <th className="px-4 py-2 font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsed.preview.map((row) => (
                        <tr
                          key={`${row.row}-${row.sku}`}
                          className="border-b border-neutral-100 dark:border-neutral-900"
                        >
                          <td className="px-4 py-2 text-neutral-500">{row.row}</td>
                          <td className="px-4 py-2">{row.productName}</td>
                          <td className="px-4 py-2">{row.brand}</td>
                          <td className="px-4 py-2 font-mono text-xs">{row.sku}</td>
                          <td className="px-4 py-2">{formatPrice(row.price)}</td>
                          <td className="px-4 py-2">{row.stock}</td>
                          <td className="px-4 py-2 capitalize">{row.action}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex flex-wrap justify-end gap-3">
                <Button type="button" variant="outline" onClick={reset} disabled={busy}>
                  Choose Another File
                </Button>
                <Button
                  type="button"
                  onClick={handleConfirm}
                  disabled={busy || !canConfirmProductImport(parsed)}
                >
                  Confirm Import
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  danger = false,
}: {
  label: string;
  value: number;
  danger?: boolean;
}) {
  return (
    <div className="rounded-xl border border-neutral-200 px-4 py-3 dark:border-neutral-800">
      <p className="text-xs uppercase tracking-wide text-neutral-400">{label}</p>
      <p
        className={cn(
          "mt-1 text-2xl font-semibold",
          danger && value > 0 ? "text-red-600" : "text-neutral-900 dark:text-white"
        )}
      >
        {value}
      </p>
    </div>
  );
}

function IssueList({
  title,
  items,
  tone,
}: {
  title: string;
  items: Array<{ row: number; message: string }>;
  tone: "error" | "warning";
}) {
  return (
    <div
      className={cn(
        "rounded-xl border px-4 py-3",
        tone === "error"
          ? "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30"
          : "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/20"
      )}
    >
      <div className="mb-2 flex items-center gap-2 text-sm font-medium">
        <AlertTriangle
          className={cn(
            "h-4 w-4",
            tone === "error" ? "text-red-600" : "text-amber-600"
          )}
        />
        {title}
      </div>
      <ul className="max-h-40 space-y-1 overflow-auto text-sm">
        {items.map((item, index) => (
          <li
            key={`${item.row}-${index}`}
            className={tone === "error" ? "text-red-700" : "text-amber-800"}
          >
            Row {item.row}: {item.message}
          </li>
        ))}
      </ul>
    </div>
  );
}

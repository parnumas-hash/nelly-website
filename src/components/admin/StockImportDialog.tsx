"use client";

import { useRef, useState } from "react";
import { FileSpreadsheet, Upload, X } from "lucide-react";
import Button from "@/components/ui/Button";
import { useCatalog } from "@/context/CatalogContext";
import { useAdminSession } from "@/context/AdminSessionContext";
import {
  canConfirmStockImport,
  downloadStockImportTemplate,
  parseStockImportWorkbook,
  type ParsedStockImport,
} from "@/lib/admin/stock-import";

interface StockImportDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function StockImportDialog({ open, onClose }: StockImportDialogProps) {
  const { importStock, ready } = useCatalog();
  const { hasPermission } = useAdminSession();
  const canWrite = hasPermission("products:write");
  const inputRef = useRef<HTMLInputElement>(null);
  const [parsed, setParsed] = useState<ParsedStockImport | null>(null);
  const [fileName, setFileName] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ updated: number; skipped: number } | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const reset = () => {
    setParsed(null);
    setFileName("");
    setResult(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleConfirm = () => {
    if (!canWrite || !parsed || !canConfirmStockImport(parsed) || !ready) return;

    setBusy(true);
    try {
      const summary = importStock(parsed.rows);
      setResult(summary);
      setParsed(null);
      setError(null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} aria-hidden />
      <div className="relative max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xl dark:border-neutral-800 dark:bg-neutral-950">
        <div className="flex items-start justify-between border-b border-neutral-200 px-6 py-4 dark:border-neutral-800">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Import Stock</h2>
            <p className="mt-1 text-sm text-neutral-500">
              Upload an Excel file with SKU and stock columns.
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
            <Button type="button" variant="outline" onClick={downloadStockImportTemplate}>
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
              onChange={async (event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                setBusy(true);
                setError(null);
                setResult(null);
                try {
                  const buffer = await file.arrayBuffer();
                  setFileName(file.name);
                  setParsed(parseStockImportWorkbook(buffer));
                } catch (parseError) {
                  setParsed(null);
                  setError(
                    parseError instanceof Error
                      ? parseError.message
                      : "Could not read the Excel file."
                  );
                } finally {
                  setBusy(false);
                }
              }}
            />
          </div>

          {fileName ? <p className="mt-4 text-sm text-neutral-500">File: {fileName}</p> : null}
          {error ? (
            <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          ) : null}
          {result ? (
            <p className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
              Stock import complete — updated {result.updated} variant(s), skipped{" "}
              {result.skipped}.
            </p>
          ) : null}

          {parsed ? (
            <div className="mt-6 space-y-4">
              <p className="text-sm text-neutral-600">
                {parsed.rows.length} row(s) ready
                {parsed.issues.length > 0
                  ? ` · ${parsed.issues.length} issue(s)`
                  : ""}
              </p>
              {parsed.issues.length > 0 ? (
                <ul className="max-h-40 space-y-1 overflow-auto rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  {parsed.issues.map((issue, index) => (
                    <li key={`${issue.row}-${index}`}>
                      Row {issue.row}: {issue.message}
                    </li>
                  ))}
                </ul>
              ) : null}
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={reset} disabled={busy}>
                  Choose Another File
                </Button>
                <Button
                  type="button"
                  onClick={handleConfirm}
                  disabled={busy || !canConfirmStockImport(parsed)}
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

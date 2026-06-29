"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ImageIcon, Upload, X } from "lucide-react";
import { readBrandImageFile } from "@/lib/brand-image";
import { BRAND_LOGO_HEIGHT, BRAND_LOGO_WIDTH } from "@/lib/brand-assets";
import { shouldUnoptimize } from "@/lib/image-utils";
import { cn } from "@/lib/utils";

interface FooterLogoUploadProps {
  logoUrl: string;
  onChange: (logoUrl: string) => void;
  label?: string;
  uploadLabel?: string;
  aspectClass?: string;
  maxWidthClass?: string;
  imagePaddingClass?: string;
}

export default function FooterLogoUpload({
  logoUrl,
  onChange,
  label = "Footer Logo",
  uploadLabel = "Upload footer logo",
  aspectClass = "aspect-square",
  maxWidthClass = "max-w-[280px]",
  imagePaddingClass = "p-6",
}: FooterLogoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const dataUrl = await readBrandImageFile(file);
      onChange(dataUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
        {label}
      </label>

      <div
        role="button"
        tabIndex={0}
        onClick={() => !uploading && inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (!uploading) inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          void handleFile(e.dataTransfer.files[0]);
        }}
        className={cn(
          "group relative mx-auto w-full cursor-pointer overflow-hidden rounded-xl border-2 border-dashed bg-white transition-colors dark:bg-neutral-900",
          aspectClass,
          maxWidthClass,
          dragOver
            ? "border-primary bg-primary/5"
            : "border-neutral-200 hover:border-neutral-300 dark:border-neutral-700 dark:hover:border-neutral-600",
          uploading && "pointer-events-none opacity-70"
        )}
      >
        {logoUrl ? (
          <>
            <Image
              src={logoUrl}
              alt="Footer logo preview"
              fill
              className={cn("object-contain", imagePaddingClass)}
              unoptimized={shouldUnoptimize(logoUrl)}
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-opacity group-hover:bg-black/40 group-hover:opacity-100">
              <span className="flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-xs font-medium text-neutral-900">
                <Upload className="h-3.5 w-3.5" />
                {uploading ? "Uploading…" : "Change logo"}
              </span>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white opacity-0 transition-opacity hover:bg-black/80 group-hover:opacity-100"
              aria-label="Remove logo"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center px-4 text-center">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-neutral-50 dark:bg-neutral-800">
              <ImageIcon className="h-4 w-4 text-neutral-400" />
            </div>
            <p className="text-sm font-medium text-neutral-600 dark:text-neutral-300">
              {uploading ? "Processing…" : uploadLabel}
            </p>
            <p className="mt-1 text-xs text-neutral-400">
              PNG or JPG · up to 5 MB · {BRAND_LOGO_WIDTH}×{BRAND_LOGO_HEIGHT} recommended
            </p>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => void handleFile(e.target.files?.[0])}
      />

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}

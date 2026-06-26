"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ImageIcon, Upload, X } from "lucide-react";
import BrandImageCropModal from "@/components/admin/BrandImageCropModal";
import { shouldUnoptimize } from "@/lib/image-utils";
import { readBrandImageFile } from "@/lib/brand-image";
import { cn } from "@/lib/utils";

interface BrandImageUploadProps {
  image: string;
  hasCustomImage: boolean;
  brandName: string;
  onChange: (image: string, hasCustomImage: boolean) => void;
}

export default function BrandImageUpload({
  image,
  hasCustomImage,
  brandName,
  onChange,
}: BrandImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingCrop, setPendingCrop] = useState<{
    src: string;
    mimeType: string;
  } | null>(null);

  const previewSrc = hasCustomImage && image ? image : null;
  const initial = brandName.charAt(0);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    try {
      const base64 = await readBrandImageFile(file);
      setPendingCrop({ src: base64, mimeType: file.type || "image/jpeg" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    }
  };

  const handleFiles = (files: FileList | null) => {
    if (!files?.[0]) return;
    void handleFile(files[0]);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("", false);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const closeCropModal = () => {
    setPendingCrop(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleCropApply = (croppedBase64: string) => {
    onChange(croppedBase64, true);
    closeCropModal();
  };

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
        Brand Image
      </label>

      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
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
          "group relative aspect-square max-w-[220px] cursor-pointer overflow-hidden rounded-xl border-2 border-dashed bg-neutral-50 transition-colors dark:bg-neutral-800/50",
          dragOver
            ? "border-primary bg-primary/5"
            : "border-neutral-200 hover:border-neutral-300 dark:border-neutral-700 dark:hover:border-neutral-600"
        )}
      >
        {previewSrc ? (
          <>
            <Image
              src={previewSrc}
              alt={brandName}
              fill
              className="object-contain p-3"
              unoptimized={shouldUnoptimize(previewSrc)}
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-opacity group-hover:bg-black/40 group-hover:opacity-100">
              <span className="flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-xs font-medium text-neutral-900">
                <Upload className="h-3.5 w-3.5" />
                Change image
              </span>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white opacity-0 transition-opacity hover:bg-black/80 group-hover:opacity-100"
              aria-label="Remove image"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center px-4">
            <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white text-lg font-display font-semibold text-neutral-300 shadow-sm ring-1 ring-neutral-100 dark:bg-neutral-900 dark:ring-neutral-700">
              {initial}
            </span>
            <div className="flex flex-col items-center text-center">
              <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm dark:bg-neutral-900">
                <ImageIcon className="h-3.5 w-3.5 text-neutral-400" />
              </div>
              <p className="text-xs font-medium text-neutral-600 dark:text-neutral-300">
                Upload logo
              </p>
              <p className="mt-1 text-[10px] text-neutral-400">
                Square 1:1 · PNG, JPG up to 2 MB
              </p>
            </div>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

      {pendingCrop && (
        <BrandImageCropModal
          imageSrc={pendingCrop.src}
          mimeType={pendingCrop.mimeType}
          brandName={brandName}
          onApply={handleCropApply}
          onCancel={closeCropModal}
        />
      )}
    </div>
  );
}

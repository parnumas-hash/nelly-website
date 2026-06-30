"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ImageIcon, Upload, X } from "lucide-react";
import ImageCropModal from "@/components/admin/ImageCropModal";
import { readBannerImageFile } from "@/lib/banner-image";
import { imageNeedsCrop } from "@/lib/crop-image";
import { HERO_BANNER_ASPECT } from "@/lib/brand-assets";
import { shouldUnoptimizeBanner } from "@/lib/image-utils";
import {
  formatUploadHint,
  SITE_IMAGE_SPECS,
} from "@/lib/site-content-image-specs";
import { cn } from "@/lib/utils";

interface BannerImageUploadProps {
  posterUrl: string;
  onChange: (posterUrl: string) => void;
}

const bannerSpec = SITE_IMAGE_SPECS.heroBanner;

export default function BannerImageUpload({
  posterUrl,
  onChange,
}: BannerImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingCrop, setPendingCrop] = useState<{
    src: string;
    mimeType: string;
  } | null>(null);

  const uploadHint = formatUploadHint(bannerSpec);

  const closeCropModal = () => {
    setPendingCrop(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleCropApply = (croppedBase64: string) => {
    onChange(croppedBase64);
    closeCropModal();
  };

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    setUploading(true);
    let openedCropModal = false;
    try {
      const dataUrl = await readBannerImageFile(file);
      const mimeType = file.type || "image/jpeg";

      if (await imageNeedsCrop(dataUrl, bannerSpec.aspect)) {
        setPendingCrop({ src: dataUrl, mimeType });
        openedCropModal = true;
        return;
      }

      onChange(dataUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (!openedCropModal && inputRef.current) inputRef.current.value = "";
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
        Banner Image
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
          "group relative w-full cursor-pointer overflow-hidden rounded-xl border-2 border-dashed bg-[#f7f3ee] transition-colors dark:bg-neutral-800/50",
          dragOver
            ? "border-primary bg-primary/5"
            : "border-neutral-200 hover:border-neutral-300 dark:border-neutral-700 dark:hover:border-neutral-600",
          uploading && "pointer-events-none opacity-70"
        )}
        style={{ aspectRatio: HERO_BANNER_ASPECT }}
      >
        {posterUrl ? (
          <>
            <Image
              src={posterUrl}
              alt="Banner preview"
              fill
              className="object-contain object-center"
              unoptimized={shouldUnoptimizeBanner(posterUrl)}
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-opacity group-hover:bg-black/40 group-hover:opacity-100">
              <span className="flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-xs font-medium text-neutral-900">
                <Upload className="h-3.5 w-3.5" />
                {uploading ? "Uploading…" : "Change banner"}
              </span>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white opacity-0 transition-opacity hover:bg-black/80 group-hover:opacity-100"
              aria-label="Remove banner image"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center px-4 text-center">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm dark:bg-neutral-900">
              <ImageIcon className="h-4 w-4 text-neutral-400" />
            </div>
            <p className="text-sm font-medium text-neutral-600 dark:text-neutral-300">
              {uploading ? "Processing image…" : "Upload banner image"}
            </p>
            <p className="mt-1 text-xs text-neutral-400">{uploadHint}</p>
          </div>
        )}
      </div>

      {posterUrl && (
        <p className="mt-2 text-xs text-neutral-400">{uploadHint}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => void handleFile(e.target.files?.[0])}
      />

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

      {pendingCrop && (
        <ImageCropModal
          imageSrc={pendingCrop.src}
          mimeType={pendingCrop.mimeType}
          spec={bannerSpec}
          onApply={handleCropApply}
          onCancel={closeCropModal}
        />
      )}
    </div>
  );
}

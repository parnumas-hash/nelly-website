"use client";



import Image from "next/image";

import { useMemo, useRef, useState } from "react";

import { createPortal } from "react-dom";

import { ImageIcon, Upload, X } from "lucide-react";

import CategoryImageCropModal from "@/components/admin/CategoryImageCropModal";

import { useCatalog } from "@/context/CatalogContext";

import { readBrandImageFile } from "@/lib/brand-image";

import { compressDataUrl } from "@/lib/media-compress";

import {

  PLACEHOLDER_IMAGE,

  resolveCategoryImageUrl,

  shouldUnoptimize,

} from "@/lib/image-utils";

import { cn } from "@/lib/utils";



interface CategoryImageUploadProps {

  imageId: string;

  categoryName: string;

  onChange: (imageId: string) => void;

}



export default function CategoryImageUpload({

  imageId,

  categoryName,

  onChange,

}: CategoryImageUploadProps) {

  const inputRef = useRef<HTMLInputElement>(null);

  const { getMediaUrl } = useCatalog();

  const [pendingCrop, setPendingCrop] = useState<{

    src: string;

    mimeType: string;

  } | null>(null);

  const [error, setError] = useState<string | null>(null);



  const previewUrl = useMemo(() => {

    const url = resolveCategoryImageUrl({ imageId }, getMediaUrl);

    return url === PLACEHOLDER_IMAGE ? null : url;

  }, [imageId, getMediaUrl]);



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



  const closeCropModal = () => {

    setPendingCrop(null);

    if (inputRef.current) inputRef.current.value = "";

  };



  const handleCropApply = async (croppedBase64: string) => {

    try {

      const compressed = await compressDataUrl(croppedBase64);

      onChange(compressed);

      closeCropModal();

    } catch (err) {

      setError(err instanceof Error ? err.message : "Could not save image.");

    }

  };



  const handleRemove = (e: React.MouseEvent) => {

    e.stopPropagation();

    onChange("");

    if (inputRef.current) inputRef.current.value = "";

  };



  return (

    <div>

      <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">

        Category Image{" "}

        <span className="font-normal text-neutral-400">

          (shown in admin list; optional on storefront)

        </span>

      </label>



      <div

        role="button"

        tabIndex={0}

        onClick={(e) => {

          e.preventDefault();

          inputRef.current?.click();

        }}

        onKeyDown={(e) => {

          if (e.key === "Enter" || e.key === " ") {

            e.preventDefault();

            inputRef.current?.click();

          }

        }}

        className={cn(

          "group relative aspect-[4/3] cursor-pointer overflow-hidden rounded-xl border-2 border-dashed border-neutral-200 bg-neutral-50 transition-colors hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800/50"

        )}

      >

        {previewUrl ? (

          <>

            <Image

              src={previewUrl}

              alt={categoryName}

              fill

              className="object-cover"

              unoptimized={shouldUnoptimize(previewUrl)}

            />

            <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-opacity group-hover:bg-black/40 group-hover:opacity-100">

              <span className="rounded-full bg-white/95 px-4 py-2 text-xs font-medium text-neutral-900">

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

            <Image

              src={PLACEHOLDER_IMAGE}

              alt=""

              fill

              className="object-cover opacity-40"

              aria-hidden

            />

            <div className="relative z-10 flex flex-col items-center text-center">

              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm dark:bg-neutral-900">

                <ImageIcon className="h-4 w-4 text-neutral-400" />

              </div>

              <p className="text-xs font-medium text-neutral-600 dark:text-neutral-300">

                Upload image

              </p>

              <p className="mt-1 flex items-center gap-1 text-[10px] text-neutral-400">

                <Upload className="h-3 w-3" />

                Square or 4:3 crop · max 5 MB (auto-compressed)

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

        onChange={(e) => void handleFile(e.target.files?.[0])}

      />



      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}



      {pendingCrop &&

        typeof document !== "undefined" &&

        createPortal(

          <CategoryImageCropModal

            imageSrc={pendingCrop.src}

            mimeType={pendingCrop.mimeType}

            title={categoryName || "Category"}

            onApply={(cropped) => void handleCropApply(cropped)}

            onCancel={closeCropModal}

          />,

          document.body

        )}

    </div>

  );

}



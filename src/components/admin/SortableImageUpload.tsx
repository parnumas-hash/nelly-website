"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { GripVertical, Upload, X } from "lucide-react";
import { useCatalog } from "@/context/CatalogContext";
import { cn } from "@/lib/utils";
import { shouldUnoptimize } from "@/lib/image-utils";

import { MAX_VARIANT_IMAGES } from "@/lib/variant-matrix";

interface SortableImageUploadProps {
  imageIds: string[];
  onChange: (imageIds: string[]) => void;
  label?: string;
  maxImages?: number;
}

export default function SortableImageUpload({
  imageIds,
  onChange,
  label = "Variant Images",
  maxImages = MAX_VARIANT_IMAGES,
}: SortableImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { addMedia, getMediaUrl, storageError } = useCatalog();
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    setUploadError(null);
    const nextIds = [...imageIds];
    const remaining = maxImages - nextIds.length;

    if (remaining <= 0) {
      setUploadError(`Maximum ${maxImages} images per variant.`);
      return;
    }

    for (const file of Array.from(files).slice(0, remaining)) {
      if (!file.type.startsWith("image/")) continue;
      try {
        const item = await addMedia(file);
        nextIds.push(item.id);
      } catch (err) {
        setUploadError(
          err instanceof Error ? err.message : "Could not upload image."
        );
        break;
      }
    }

    if (nextIds.length !== imageIds.length) {
      onChange(nextIds);
    }

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const reorder = (from: number, to: number) => {
    if (from === to) return;
    const next = [...imageIds];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
  };

  const errorMessage = uploadError ?? storageError;

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
        {label}
      </label>

      <div
        onClick={() => inputRef.current?.click()}
        className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-200 px-4 py-6 transition-colors hover:border-primary hover:bg-primary/5 dark:border-neutral-700"
      >
        <Upload className="mb-2 h-6 w-6 text-neutral-400" />
        <p className="text-xs text-neutral-500">Click to upload · drag to reorder</p>
        <p className="mt-1 text-[10px] text-neutral-400">
          Up to {maxImages} images · max 5 MB · up to 1920px high quality
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => void handleFiles(e.target.files)}
      />

      {errorMessage && (
        <p className="mt-2 text-xs text-red-600">{errorMessage}</p>
      )}

      {imageIds.length > 0 && (
        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {imageIds.map((id, i) => {
            const url = getMediaUrl(id);
            return (
              <div
                key={id}
                draggable
                onDragStart={() => setDragIndex(i)}
                onDragOver={(e) => {
                  e.preventDefault();
                  setOverIndex(i);
                }}
                onDragLeave={() => setOverIndex(null)}
                onDrop={() => {
                  if (dragIndex !== null) reorder(dragIndex, i);
                  setDragIndex(null);
                  setOverIndex(null);
                }}
                onDragEnd={() => {
                  setDragIndex(null);
                  setOverIndex(null);
                }}
                className={cn(
                  "group relative aspect-square cursor-grab overflow-hidden rounded-xl bg-neutral-100 active:cursor-grabbing",
                  overIndex === i && dragIndex !== null && dragIndex !== i
                    ? "ring-2 ring-primary ring-offset-2"
                    : ""
                )}
              >
                <Image
                  src={url}
                  alt={`Image ${i + 1}`}
                  fill
                  className="object-cover"
                  unoptimized={shouldUnoptimize(url)}
                  draggable={false}
                />
                <div className="absolute left-1 top-1 flex h-6 w-6 items-center justify-center rounded-md bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100">
                  <GripVertical className="h-3.5 w-3.5" />
                </div>
                <button
                  type="button"
                  onClick={() => onChange(imageIds.filter((_, idx) => idx !== i))}
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <X className="h-3 w-3" />
                </button>
                {i === 0 && (
                  <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
                    Primary
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

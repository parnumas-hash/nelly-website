"use client";

import Image from "next/image";
import { useRef } from "react";
import { Upload, X } from "lucide-react";
import { useCatalog } from "@/context/CatalogContext";
import { cn } from "@/lib/utils";
import { shouldUnoptimize } from "@/lib/image-utils";

interface ImageUploadFieldProps {
  imageIds: string[];
  onChange: (imageIds: string[]) => void;
  label?: string;
}

export default function ImageUploadField({
  imageIds,
  onChange,
  label = "Product Images",
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { addMedia, getMediaUrl } = useCatalog();

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    const nextIds = [...imageIds];

    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      try {
        const item = await addMedia(file);
        nextIds.push(item.id);
      } catch {
        break;
      }
    }

    onChange(nextIds);
  };

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
        {label}
      </label>

      <div
        onClick={() => inputRef.current?.click()}
        className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-200 px-6 py-8 transition-colors hover:border-primary hover:bg-primary/5 dark:border-neutral-700"
      >
        <Upload className="mb-2 h-8 w-8 text-neutral-400" />
        <p className="text-sm text-neutral-500">Click to upload images</p>
        <p className="mt-1 text-xs text-neutral-400">Max 5 MB (auto-compressed) · up to 1920px</p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => void handleFiles(e.target.files)}
      />

      {imageIds.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {imageIds.map((id, i) => (
            <div
              key={id}
              className="group relative aspect-square overflow-hidden rounded-xl bg-neutral-100"
            >
              <Image
                src={getMediaUrl(id)}
                alt={`Product image ${i + 1}`}
                fill
                className="object-cover"
                unoptimized={shouldUnoptimize(getMediaUrl(id))}
              />
              <button
                type="button"
                onClick={() => onChange(imageIds.filter((_, idx) => idx !== i))}
                className={cn(
                  "absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                )}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

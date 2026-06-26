"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Upload, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import { useCatalog } from "@/context/CatalogContext";
import { shouldUnoptimize } from "@/lib/image-utils";

export default function AdminMediaPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const {
    media,
    addMedia,
    deleteMedia,
    purgeUnusedMedia,
    unusedMediaCount,
    storageError,
    ready,
  } = useCatalog();
  const [localError, setLocalError] = useState<string | null>(null);

  if (!ready) {
    return <div className="py-20 text-center text-neutral-400">Loading...</div>;
  }

  const handleUpload = async (files: FileList | null) => {
    if (!files) return;
    setLocalError(null);
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      try {
        await addMedia(file);
      } catch (err) {
        setLocalError(
          err instanceof Error ? err.message : "Could not upload image."
        );
        break;
      }
    }
  };

  const errorMessage = localError ?? storageError;

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Media</h1>
          <p className="mt-1 text-neutral-500">
            {media.length} files in library
            {unusedMediaCount > 0
              ? ` · ${unusedMediaCount} unused`
              : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {unusedMediaCount > 0 && (
            <Button
              variant="outline"
              onClick={() => purgeUnusedMedia()}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Remove Unused ({unusedMediaCount})
            </Button>
          )}
          <Button onClick={() => inputRef.current?.click()} className="gap-2">
            <Upload className="h-4 w-4" />
            Upload
          </Button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => void handleUpload(e.target.files)}
        />
      </div>

      {errorMessage && (
        <p className="mb-4 text-sm text-red-600">{errorMessage}</p>
      )}

      {media.length === 0 ? (
        <div
          onClick={() => inputRef.current?.click()}
          className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-neutral-200 py-20 dark:border-neutral-800"
        >
          <Upload className="mb-3 h-10 w-10 text-neutral-300" />
          <p className="text-neutral-500">Upload your first image</p>
          <p className="mt-1 text-xs text-neutral-400">Max 5 MB · compressed to 800px JPEG</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {media.map((item) => (
            <div
              key={item.id}
              className="group overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
            >
              <div className="relative aspect-square bg-neutral-50">
                <Image
                  src={item.url}
                  alt={item.name}
                  fill
                  className="object-contain p-2"
                  unoptimized={shouldUnoptimize(item.url)}
                />
                <button
                  onClick={() => deleteMedia(item.id)}
                  className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  aria-label={`Delete ${item.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <p className="truncate px-3 py-2 text-xs text-neutral-500">{item.name}</p>
              <p className="truncate px-3 pb-2 font-mono text-[10px] text-neutral-400">
                {item.id}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

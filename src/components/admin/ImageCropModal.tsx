"use client";

import { useCallback, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import "react-easy-crop/react-easy-crop.css";
import Button from "@/components/ui/Button";
import { getCroppedImageBase64 } from "@/lib/crop-image";
import type { ImageUploadSpec } from "@/lib/site-content-image-specs";
import { formatUploadHint } from "@/lib/site-content-image-specs";

interface ImageCropModalProps {
  imageSrc: string;
  mimeType: string;
  spec: ImageUploadSpec;
  onApply: (croppedBase64: string) => void;
  onCancel: () => void;
}

export default function ImageCropModal({
  imageSrc,
  mimeType,
  spec,
  onApply,
  onCancel,
}: ImageCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onCropComplete = useCallback((_area: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleApply = async () => {
    if (!croppedAreaPixels) return;
    setApplying(true);
    setError(null);
    try {
      const cropped = await getCroppedImageBase64(imageSrc, croppedAreaPixels, mimeType);
      onApply(cropped);
    } catch {
      setError("Could not crop image. Please try again.");
    } finally {
      setApplying(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="image-crop-title"
    >
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-neutral-900">
        <div className="border-b border-neutral-100 px-6 py-5 dark:border-neutral-800">
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-primary">
            Adjust crop
          </p>
          <h2
            id="image-crop-title"
            className="mt-1 text-lg font-semibold tracking-tight text-neutral-900 dark:text-white"
          >
            {spec.cropTitle}
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            {spec.cropSubtitle ??
              `${spec.aspectLabel} · ${formatUploadHint(spec).split(" · ").slice(2).join(" · ")}`}
          </p>
        </div>

        <div
          className="relative mx-auto w-full max-h-[min(55vh,520px)] bg-neutral-950"
          style={{ aspectRatio: spec.aspect }}
        >
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={spec.aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            objectFit={spec.cropObjectFit ?? "cover"}
            showGrid
          />
        </div>

        <div className="space-y-5 px-6 py-5">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">Zoom</p>
              <span className="text-xs tabular-nums text-neutral-400">{zoom.toFixed(1)}×</span>
            </div>
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-neutral-200 accent-primary dark:bg-neutral-700"
              aria-label="Zoom"
            />
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <div className="flex gap-3 pt-1">
            <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              type="button"
              className="flex-1"
              onClick={() => void handleApply()}
              disabled={!croppedAreaPixels || applying}
            >
              {applying ? "Applying…" : "Apply Crop"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

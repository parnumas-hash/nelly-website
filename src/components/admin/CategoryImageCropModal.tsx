"use client";



import { useCallback, useState } from "react";

import Cropper, { type Area } from "react-easy-crop";

import "react-easy-crop/react-easy-crop.css";

import Button from "@/components/ui/Button";

import {

  CATEGORY_CROP_ASPECTS,

  CategoryCropMode,

  createImage,

  getCroppedImageBase64,

} from "@/lib/crop-image";

import { cn } from "@/lib/utils";



interface CategoryImageCropModalProps {

  imageSrc: string;

  mimeType: string;

  title: string;

  onApply: (croppedBase64: string) => void;

  onCancel: () => void;

}



const CROP_LABELS: Record<CategoryCropMode, string> = {

  square: "Square 1:1",

  landscape: "Landscape 4:3",

};



export default function CategoryImageCropModal({

  imageSrc,

  mimeType,

  title,

  onApply,

  onCancel,

}: CategoryImageCropModalProps) {

  const [cropMode, setCropMode] = useState<CategoryCropMode>("landscape");

  const [crop, setCrop] = useState({ x: 0, y: 0 });

  const [zoom, setZoom] = useState(1);

  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const [applying, setApplying] = useState(false);

  const [error, setError] = useState<string | null>(null);



  const onCropAreaChange = useCallback((_area: Area, pixels: Area) => {

    setCroppedAreaPixels(pixels);

  }, []);



  const handleModeChange = (mode: CategoryCropMode) => {

    setCropMode(mode);

    setCrop({ x: 0, y: 0 });

    setZoom(1);

    setCroppedAreaPixels(null);

  };



  const handleApply = async () => {

    setApplying(true);

    setError(null);

    try {

      let pixels = croppedAreaPixels;

      if (!pixels) {

        const image = await createImage(imageSrc);

        pixels = {

          x: 0,

          y: 0,

          width: image.naturalWidth || image.width,

          height: image.naturalHeight || image.height,

        };

      }

      const cropped = await getCroppedImageBase64(

        imageSrc,

        pixels,

        mimeType

      );

      onApply(cropped);

    } catch {

      setError("Could not crop image. Please try again.");

    } finally {

      setApplying(false);

    }

  };



  return (

    <div

      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"

      role="dialog"

      aria-modal="true"

      onClick={(e) => {

        if (e.target === e.currentTarget) onCancel();

      }}

    >

      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-neutral-900">

        <div className="border-b border-neutral-100 px-6 py-5 dark:border-neutral-800">

          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-primary">

            Crop Category Image

          </p>

          <h2 className="mt-1 text-lg font-semibold tracking-tight text-neutral-900 dark:text-white">

            {title}

          </h2>

        </div>



        <div className="relative aspect-[4/3] bg-neutral-950">

          <Cropper

            image={imageSrc}

            crop={crop}

            zoom={zoom}

            aspect={CATEGORY_CROP_ASPECTS[cropMode]}

            onCropChange={setCrop}

            onZoomChange={setZoom}

            onCropAreaChange={onCropAreaChange}

            objectFit="contain"

            showGrid={false}

          />

        </div>



        <div className="space-y-5 px-6 py-5">

          <div>

            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-neutral-500">

              Crop Ratio

            </p>

            <div className="flex gap-2">

              {(Object.keys(CATEGORY_CROP_ASPECTS) as CategoryCropMode[]).map(

                (mode) => (

                  <button

                    key={mode}

                    type="button"

                    onClick={() => handleModeChange(mode)}

                    className={cn(

                      "flex-1 rounded-full border px-3 py-2 text-xs font-medium transition-colors",

                      cropMode === mode

                        ? "border-primary bg-primary text-white"

                        : "border-neutral-200 text-neutral-600 hover:border-neutral-300 dark:border-neutral-700 dark:text-neutral-300"

                    )}

                  >

                    {CROP_LABELS[mode]}

                  </button>

                )

              )}

            </div>

          </div>



          <div>

            <div className="mb-2 flex items-center justify-between">

              <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">

                Zoom

              </p>

              <span className="text-xs tabular-nums text-neutral-400">

                {zoom.toFixed(1)}×

              </span>

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



          <div className="flex gap-3">

            <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>

              Cancel

            </Button>

            <Button

              type="button"

              className="flex-1"

              onClick={() => void handleApply()}

              disabled={applying}

            >

              {applying ? "Applying…" : "Apply Crop"}

            </Button>

          </div>

        </div>

      </div>

    </div>

  );

}



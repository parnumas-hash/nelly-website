"use client";

import { useEffect, useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import BrandImageUpload from "@/components/admin/BrandImageUpload";
import { useCatalog } from "@/context/CatalogContext";
import { AdminBrand } from "@/types";
import { Check } from "lucide-react";

interface BrandEditorCardProps {
  brand: AdminBrand;
}

export default function BrandEditorCard({ brand }: BrandEditorCardProps) {
  const { updateBrand } = useCatalog();
  const [displayName, setDisplayName] = useState(brand.displayName);
  const [tagline, setTagline] = useState(brand.tagline);
  const [image, setImage] = useState(brand.image);
  const [hasCustomImage, setHasCustomImage] = useState(brand.hasCustomImage ?? false);
  const [active, setActive] = useState(brand.active);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setDisplayName(brand.displayName);
    setTagline(brand.tagline);
    setImage(brand.image);
    setHasCustomImage(brand.hasCustomImage ?? false);
    setActive(brand.active);
  }, [brand]);

  const isDirty =
    displayName !== brand.displayName ||
    tagline !== brand.tagline ||
    image !== brand.image ||
    hasCustomImage !== (brand.hasCustomImage ?? false) ||
    active !== brand.active;

  const handleSave = () => {
    updateBrand(brand.id, {
      displayName,
      name: displayName,
      tagline,
      image: hasCustomImage ? image : "",
      hasCustomImage,
      active,
    });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-neutral-400">
            {brand.slug}
          </p>
          <h2 className="mt-1 text-sm font-semibold text-neutral-900 dark:text-white">
            {brand.name}
          </h2>
        </div>
        {saved && (
          <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
            <Check className="h-3.5 w-3.5" />
            Saved
          </span>
        )}
      </div>

      <BrandImageUpload
        image={image}
        hasCustomImage={hasCustomImage}
        brandName={displayName}
        onChange={(nextImage, nextHasCustom) => {
          setImage(nextImage);
          setHasCustomImage(nextHasCustom);
        }}
      />

      <div className="mt-4 space-y-3">
        <Input
          id={`name-${brand.id}`}
          label="Display Name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />
        <Input
          id={`tagline-${brand.id}`}
          label="Tagline"
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
        />
        <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="rounded border-neutral-300 text-primary focus:ring-primary"
          />
          Active on storefront
        </label>
      </div>

      <Button
        type="button"
        onClick={handleSave}
        disabled={!isDirty}
        className="mt-5 w-full"
        size="sm"
      >
        Save Changes
      </Button>
    </div>
  );
}

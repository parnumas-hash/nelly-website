"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import FooterLogoUpload from "@/components/admin/FooterLogoUpload";
import ProductIdPickerFields from "@/components/admin/site-content/ProductIdPickerFields";
import CollectionSection from "@/components/home/CollectionSection";
import { useSiteContentSave } from "@/components/admin/AdminToast";
import { useCatalog } from "@/context/CatalogContext";
import { getDefaultHomeCollections } from "@/lib/admin/storage";
import { getCollectionTab } from "@/lib/admin/site-content-tabs";
import {
  HOMEPAGE_PRODUCT_GRID_LIMIT,
  resolveEcoCollectionProducts,
  resolveHomeLivingProducts,
  resolveTravelCollectionProducts,
} from "@/lib/homepage-product-selection";
import { shouldUnoptimize } from "@/lib/image-utils";
import { SITE_IMAGE_SPECS } from "@/lib/site-content-image-specs";
import type { HomeCollection, HomeCollectionKey, HomeCollections } from "@/types";

interface CollectionSectionEditorProps {
  collectionKey: HomeCollectionKey;
}

const COLLECTION_RESOLVERS = {
  travel: resolveTravelCollectionProducts,
  home: resolveHomeLivingProducts,
  eco: resolveEcoCollectionProducts,
} as const;

const AUTO_DESCRIPTIONS: Record<HomeCollectionKey, string> = {
  travel:
    "Pick up to 4 published products. Leave all empty to auto-show strollers and accessories.",
  home: "Pick up to 4 published products. Leave all empty to auto-show beds.",
  eco: "Pick up to 4 published products. Leave all empty to auto-show eco-tagged products.",
};

function updateCollection(
  form: HomeCollections,
  key: HomeCollectionKey,
  patch: Partial<HomeCollection>
): HomeCollections {
  return { ...form, [key]: { ...form[key], ...patch } };
}

export default function CollectionSectionEditor({
  collectionKey,
}: CollectionSectionEditorProps) {
  const { homeCollections, updateHomeCollections, publishedProducts, ready } =
    useCatalog();
  const [form, setForm] = useState(homeCollections);
  const tab = getCollectionTab(collectionKey);

  const saveWithToast = useSiteContentSave();

  useEffect(() => {
    setForm(homeCollections);
  }, [homeCollections]);

  const block = form[collectionKey];
  const defaults = getDefaultHomeCollections();
  const previewImage = block.imageUrl || defaults[collectionKey].imageUrl;
  const usingManualSelection = (block.productIds ?? []).some(Boolean);

  const previewProducts = useMemo(() => {
    if (!ready) return [];
    return COLLECTION_RESOLVERS[collectionKey](
      publishedProducts,
      block.productIds
    );
  }, [ready, publishedProducts, block.productIds, collectionKey]);

  if (!ready) {
    return <div className="py-20 text-center text-neutral-400">Loading...</div>;
  }

  const save = () => saveWithToast(() => updateHomeCollections(form));
  const applyDefault = () => {
    const nextDefaults = getDefaultHomeCollections();
    setForm((prev) => ({
      ...prev,
      [collectionKey]: nextDefaults[collectionKey],
    }));
  };

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
        <FooterLogoUpload
          label="Collection image"
          uploadLabel="Upload collection image"
          aspectClass="aspect-[5/4]"
          maxWidthClass="max-w-full"
          imagePaddingClass="p-0"
          imageSpec={SITE_IMAGE_SPECS.collectionLandscape}
          logoUrl={block.imageUrl}
          onChange={(imageUrl) =>
            setForm((prev) =>
              updateCollection(prev, collectionKey, { imageUrl })
            )
          }
        />
        <Input
          id={`${collectionKey}-imageUrl`}
          label="Image URL"
          value={block.imageUrl}
          onChange={(e) =>
            setForm((prev) =>
              updateCollection(prev, collectionKey, { imageUrl: e.target.value })
            )
          }
        />
        <Input
          id={`${collectionKey}-title`}
          label="Title"
          value={block.title}
          onChange={(e) =>
            setForm((prev) =>
              updateCollection(prev, collectionKey, { title: e.target.value })
            )
          }
        />
        <div>
          <label
            htmlFor={`${collectionKey}-description`}
            className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
          >
            Description
          </label>
          <textarea
            id={`${collectionKey}-description`}
            value={block.description}
            onChange={(e) =>
              setForm((prev) =>
                updateCollection(prev, collectionKey, {
                  description: e.target.value,
                })
              )
            }
            rows={4}
            className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white"
          />
        </div>
        <Input
          id={`${collectionKey}-href`}
          label="Shop link"
          value={block.href}
          onChange={(e) =>
            setForm((prev) =>
              updateCollection(prev, collectionKey, { href: e.target.value })
            )
          }
          placeholder="/shop?category=strollers"
        />
        <Input
          id={`${collectionKey}-imageAlt`}
          label="Image alt text"
          value={block.imageAlt}
          onChange={(e) =>
            setForm((prev) =>
              updateCollection(prev, collectionKey, { imageAlt: e.target.value })
            )
          }
        />

        <ProductIdPickerFields
          description={AUTO_DESCRIPTIONS[collectionKey]}
          maxSlots={HOMEPAGE_PRODUCT_GRID_LIMIT}
          productIds={block.productIds ?? []}
          onChange={(productIds) =>
            setForm((prev) =>
              updateCollection(prev, collectionKey, { productIds })
            )
          }
          publishedProducts={publishedProducts}
        />

        <div className="flex flex-wrap gap-3">
          <Button onClick={save}>Save {tab.label}</Button>
          <Button type="button" variant="outline" onClick={applyDefault}>
            Reset to default
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800">
        <CollectionSection
          id={`${collectionKey}-preview`}
          title={block.title || defaults[collectionKey].title}
          description={block.description || defaults[collectionKey].description}
          image={previewImage}
          imageAlt={block.imageAlt || defaults[collectionKey].imageAlt}
          products={previewProducts}
          href={block.href || defaults[collectionKey].href}
          background={collectionKey === "home" ? "gray" : "white"}
          reversed={collectionKey === "home"}
        />
        <p className="bg-neutral-50 px-4 py-2 text-xs text-neutral-500 dark:bg-neutral-900">
          Live preview — {tab.label}
          {usingManualSelection ? " (manual products)" : " (automatic products)"}
        </p>
      </div>
    </div>
  );
}

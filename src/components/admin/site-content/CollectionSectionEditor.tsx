"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import FooterLogoUpload from "@/components/admin/FooterLogoUpload";
import { useCatalog } from "@/context/CatalogContext";
import { getDefaultHomeCollections } from "@/lib/admin/storage";
import { getCollectionTab } from "@/lib/admin/site-content-tabs";
import { shouldUnoptimize } from "@/lib/image-utils";
import type { HomeCollection, HomeCollectionKey, HomeCollections } from "@/types";

interface CollectionSectionEditorProps {
  collectionKey: HomeCollectionKey;
}

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
  const { homeCollections, updateHomeCollections, ready } = useCatalog();
  const [form, setForm] = useState(homeCollections);
  const tab = getCollectionTab(collectionKey);

  useEffect(() => {
    setForm(homeCollections);
  }, [homeCollections]);

  if (!ready) {
    return <div className="py-20 text-center text-neutral-400">Loading...</div>;
  }

  const save = () => updateHomeCollections(form);
  const applyDefault = () => {
    const defaults = getDefaultHomeCollections();
    setForm((prev) => ({
      ...prev,
      [collectionKey]: defaults[collectionKey],
    }));
  };
  const block = form[collectionKey];
  const defaults = getDefaultHomeCollections();
  const previewImage = block.imageUrl || defaults[collectionKey].imageUrl;

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
        <FooterLogoUpload
          label="Collection image"
          uploadLabel="Upload collection image"
          aspectClass="aspect-[5/4]"
          maxWidthClass="max-w-full"
          imagePaddingClass="p-0"
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
        <div className="flex flex-wrap gap-3">
          <Button onClick={save}>Save {tab.label}</Button>
          <Button type="button" variant="outline" onClick={applyDefault}>
            Reset to default
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800">
        <div className="bg-white p-6 dark:bg-neutral-950">
          <div className="relative aspect-[5/4] overflow-hidden rounded-2xl bg-neutral-100 dark:bg-neutral-900">
            <Image
              src={previewImage}
              alt={block.imageAlt}
              fill
              className="object-cover"
              unoptimized={shouldUnoptimize(previewImage)}
            />
          </div>
          <h2 className="mt-6 font-display text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            {block.title}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-neutral-500">
            {block.description}
          </p>
          <p className="mt-4 text-xs text-neutral-400">
            Shop link: {block.href}
          </p>
        </div>
        <p className="bg-neutral-50 px-4 py-2 text-xs text-neutral-500 dark:bg-neutral-900">
          Live preview — {tab.label}
        </p>
      </div>
    </div>
  );
}

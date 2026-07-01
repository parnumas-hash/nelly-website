"use client";

import { useEffect, useMemo, useState } from "react";
import Input from "@/components/ui/Input";
import FooterLogoUpload from "@/components/admin/FooterLogoUpload";
import SiteContentFormActions, {
  SITE_CONTENT_TEXTAREA_CLASS,
} from "@/components/admin/site-content/SiteContentFormActions";
import CollectionSection from "@/components/home/CollectionSection";
import { useCatalog } from "@/context/CatalogContext";
import { getDefaultHomepageContent } from "@/lib/admin/homepage-content";
import { resolveFirstAdventureProducts } from "@/lib/first-adventure-products";
import { SITE_IMAGE_SPECS } from "@/lib/site-content-image-specs";
import { getProductPrimarySku } from "@/lib/variants";
import { FirstAdventureSection } from "@/types";

const SELECT_CLASS =
  "w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm focus:border-primary focus:outline-none dark:border-neutral-800 dark:bg-neutral-950";

export default function FirstAdventureSectionEditor() {
  const { homepageContent, updateHomepageContent, publishedProducts, ready } =
    useCatalog();
  const [form, setForm] = useState<FirstAdventureSection>(
    homepageContent.firstAdventure
  );

  useEffect(() => {
    setForm(homepageContent.firstAdventure);
  }, [homepageContent.firstAdventure]);

  const sortedProducts = useMemo(
    () =>
      [...publishedProducts].sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
      ),
    [publishedProducts]
  );

  const previewProducts = useMemo(() => {
    if (!ready) return [];
    return resolveFirstAdventureProducts(
      publishedProducts,
      form.productIds
    );
  }, [ready, publishedProducts, form.productIds]);

  const productIds = form.productIds ?? [];
  const usingManualSelection = productIds.some(Boolean);

  if (!ready) {
    return <div className="py-20 text-center text-neutral-400">Loading...</div>;
  }

  const defaults = getDefaultHomepageContent().firstAdventure;

  const setProductSlot = (slot: 0 | 1, value: string) => {
    const next = [productIds[0] ?? "", productIds[1] ?? ""];
    next[slot] = value;
    const cleaned = next.filter(Boolean);
    setForm({
      ...form,
      productIds: cleaned.length > 0 ? cleaned : [],
    });
  };

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
        <FooterLogoUpload
          label="Section image"
          uploadLabel="Upload section image"
          aspectClass="aspect-[5/4]"
          maxWidthClass="max-w-full"
          imagePaddingClass="p-0"
          imageSpec={SITE_IMAGE_SPECS.collectionLandscape}
          logoUrl={form.imageUrl}
          onChange={(imageUrl) => setForm({ ...form, imageUrl })}
        />
        <Input
          id="first-adventure-imageUrl"
          label="Image URL"
          value={form.imageUrl}
          onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
        />
        <Input
          id="first-adventure-imageAlt"
          label="Image alt text"
          value={form.imageAlt}
          onChange={(e) => setForm({ ...form, imageAlt: e.target.value })}
        />
        <Input
          id="first-adventure-title"
          label="Heading"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <div>
          <label
            htmlFor="first-adventure-description"
            className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
          >
            Description
          </label>
          <textarea
            id="first-adventure-description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={4}
            className={SITE_CONTENT_TEXTAREA_CLASS}
          />
        </div>
        <Input
          id="first-adventure-href"
          label="Shop link"
          value={form.href}
          onChange={(e) => setForm({ ...form, href: e.target.value })}
          placeholder="/shop?sort=newest"
        />
        <Input
          id="first-adventure-ctaLabel"
          label="Link label"
          value={form.ctaLabel}
          onChange={(e) => setForm({ ...form, ctaLabel: e.target.value })}
        />

        <div className="space-y-3 rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                Featured products
              </p>
              <p className="mt-1 text-xs text-neutral-500">
                Pick up to 2 published products. Leave both empty to use
                automatic selection (new, starter tags, or featured).
              </p>
            </div>
            {usingManualSelection ? (
              <button
                type="button"
                onClick={() => setForm({ ...form, productIds: [] })}
                className="shrink-0 text-xs font-medium text-primary hover:underline"
              >
                Use automatic
              </button>
            ) : null}
          </div>

          {[0, 1].map((slot) => (
            <div key={slot}>
              <label
                htmlFor={`first-adventure-product-${slot}`}
                className="mb-2 block text-xs font-medium uppercase tracking-wide text-neutral-500"
              >
                Product {slot + 1}
              </label>
              <select
                id={`first-adventure-product-${slot}`}
                value={productIds[slot] ?? ""}
                onChange={(e) => setProductSlot(slot as 0 | 1, e.target.value)}
                className={SELECT_CLASS}
              >
                <option value="">— Not selected —</option>
                {sortedProducts.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} ({getProductPrimarySku(product.variants)})
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        <SiteContentFormActions
          saveLabel="Save First Adventure"
          onSave={() => updateHomepageContent({ firstAdventure: form })}
          onReset={() => setForm(defaults)}
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800">
        <CollectionSection
          id="first-adventure-preview"
          title={form.title || defaults.title}
          description={form.description || defaults.description}
          image={form.imageUrl || defaults.imageUrl}
          imageAlt={form.imageAlt || defaults.imageAlt}
          products={previewProducts}
          href={form.href || defaults.href}
          ctaLabel={form.ctaLabel || defaults.ctaLabel}
          background="gray"
          reversed
        />
        <p className="bg-neutral-50 px-4 py-2 text-xs text-neutral-500 dark:bg-neutral-900">
          Live preview — First Adventure
          {usingManualSelection ? " (manual products)" : " (automatic products)"}
        </p>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import Input from "@/components/ui/Input";
import ProductSection from "@/components/product/ProductSection";
import SiteContentFormActions from "@/components/admin/site-content/SiteContentFormActions";
import ProductIdPickerFields from "@/components/admin/site-content/ProductIdPickerFields";
import { useCatalog } from "@/context/CatalogContext";
import { getDefaultHomepageContent } from "@/lib/admin/homepage-content";
import {
  HOMEPAGE_PRODUCT_GRID_LIMIT,
  resolveBestSellerProducts,
  resolveNewCollectionProducts,
} from "@/lib/homepage-product-selection";
import { HomepageContent, HomepageProductGridSection } from "@/types";

type ProductGridSectionKey = "newCollection" | "bestSeller";

const SECTION_CONFIG: Record<
  ProductGridSectionKey,
  {
    saveLabel: string;
    autoDescription: string;
    background: "white" | "gray";
    resolve: typeof resolveNewCollectionProducts;
  }
> = {
  newCollection: {
    saveLabel: "Save New Collection",
    autoDescription:
      "Pick up to 4 published products. Leave all empty to show new arrivals automatically.",
    background: "gray",
    resolve: resolveNewCollectionProducts,
  },
  bestSeller: {
    saveLabel: "Save Best Seller",
    autoDescription:
      "Pick up to 4 published products. Leave all empty to show best sellers automatically.",
    background: "white",
    resolve: resolveBestSellerProducts,
  },
};

interface ProductGridSectionEditorProps {
  sectionKey: ProductGridSectionKey;
}

export default function ProductGridSectionEditor({
  sectionKey,
}: ProductGridSectionEditorProps) {
  const { homepageContent, updateHomepageContent, publishedProducts, ready } =
    useCatalog();
  const config = SECTION_CONFIG[sectionKey];
  const [form, setForm] = useState<HomepageProductGridSection>(
    homepageContent[sectionKey]
  );

  useEffect(() => {
    setForm(homepageContent[sectionKey]);
  }, [homepageContent, sectionKey]);

  const previewProducts = useMemo(() => {
    if (!ready) return [];
    return config.resolve(publishedProducts, form.productIds);
  }, [ready, publishedProducts, form.productIds, config]);

  if (!ready) {
    return <div className="py-20 text-center text-neutral-400">Loading...</div>;
  }

  const defaults = getDefaultHomepageContent()[sectionKey];
  const usingManualSelection = (form.productIds ?? []).some(Boolean);

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
        <Input
          id={`${sectionKey}-title`}
          label="Heading"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <Input
          id={`${sectionKey}-href`}
          label="View all link"
          value={form.href}
          onChange={(e) => setForm({ ...form, href: e.target.value })}
          placeholder="/shop?sort=newest"
        />
        <Input
          id={`${sectionKey}-linkLabel`}
          label="Link label"
          value={form.linkLabel}
          onChange={(e) => setForm({ ...form, linkLabel: e.target.value })}
        />

        <ProductIdPickerFields
          description={config.autoDescription}
          maxSlots={HOMEPAGE_PRODUCT_GRID_LIMIT}
          productIds={form.productIds ?? []}
          onChange={(productIds) => setForm({ ...form, productIds })}
          publishedProducts={publishedProducts}
        />

        <SiteContentFormActions
          saveLabel={config.saveLabel}
          onSave={() => updateHomepageContent({ [sectionKey]: form })}
          onReset={() => setForm(defaults)}
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800">
        <ProductSection
          title={form.title || defaults.title}
          products={previewProducts}
          href={form.href || defaults.href}
          linkLabel={form.linkLabel || defaults.linkLabel}
          background={config.background}
          limit={HOMEPAGE_PRODUCT_GRID_LIMIT}
          columns={4}
        />
        <p className="bg-neutral-50 px-4 py-2 text-xs text-neutral-500 dark:bg-neutral-900">
          Live preview — {form.title || defaults.title}
          {usingManualSelection ? " (manual products)" : " (automatic products)"}
        </p>
      </div>
    </div>
  );
}

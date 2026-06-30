"use client";

import { useEffect, useState } from "react";
import Input from "@/components/ui/Input";
import SiteContentFormActions, {
  SITE_CONTENT_TEXTAREA_CLASS,
} from "@/components/admin/site-content/SiteContentFormActions";
import { useCatalog } from "@/context/CatalogContext";
import {
  BENEFIT_ICON_OPTIONS,
  getDefaultHomepageContent,
} from "@/lib/admin/homepage-content";
import { BenefitItem, BenefitsSection } from "@/types";

export default function BenefitsSectionEditor() {
  const { homepageContent, updateHomepageContent, ready } = useCatalog();
  const [form, setForm] = useState<BenefitsSection>(homepageContent.benefits);

  useEffect(() => {
    setForm(homepageContent.benefits);
  }, [homepageContent.benefits]);

  if (!ready) {
    return <div className="py-20 text-center text-neutral-400">Loading...</div>;
  }

  const defaults = getDefaultHomepageContent().benefits;

  const updateItem = (index: number, patch: Partial<BenefitItem>) => {
    setForm((current) => ({
      ...current,
      items: current.items.map((item, i) =>
        i === index ? { ...item, ...patch } : item
      ),
    }));
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900 md:grid-cols-3">
        <Input
          id="benefits-eyebrow"
          label="Eyebrow"
          value={form.eyebrow}
          onChange={(e) => setForm({ ...form, eyebrow: e.target.value })}
        />
        <Input
          id="benefits-title"
          label="Heading"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <Input
          id="benefits-description"
          label="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {form.items.map((item, index) => (
          <div
            key={`${item.title}-${index}`}
            className="space-y-3 rounded-2xl border border-neutral-200 p-5 dark:border-neutral-800"
          >
            <p className="text-sm font-semibold">Benefit {index + 1}</p>
            <div>
              <label htmlFor={`benefit-icon-${index}`} className="mb-2 block text-sm font-medium">
                Icon
              </label>
              <select
                id={`benefit-icon-${index}`}
                value={item.icon}
                onChange={(e) =>
                  updateItem(index, {
                    icon: e.target.value as BenefitItem["icon"],
                  })
                }
                className={SITE_CONTENT_TEXTAREA_CLASS}
              >
                {BENEFIT_ICON_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <Input
              id={`benefit-title-${index}`}
              label="Title"
              value={item.title}
              onChange={(e) => updateItem(index, { title: e.target.value })}
            />
            <div>
              <label htmlFor={`benefit-desc-${index}`} className="mb-2 block text-sm font-medium">
                Description
              </label>
              <textarea
                id={`benefit-desc-${index}`}
                value={item.description}
                onChange={(e) => updateItem(index, { description: e.target.value })}
                rows={3}
                className={SITE_CONTENT_TEXTAREA_CLASS}
              />
            </div>
          </div>
        ))}
      </div>

      <SiteContentFormActions
        saveLabel="Save Benefits"
        onSave={() => updateHomepageContent({ benefits: form })}
        onReset={() => setForm(defaults)}
      />
    </div>
  );
}

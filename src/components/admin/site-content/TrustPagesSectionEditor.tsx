"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import SiteContentFormActions, {
  SITE_CONTENT_TEXTAREA_CLASS,
} from "@/components/admin/site-content/SiteContentFormActions";
import { useCatalog } from "@/context/CatalogContext";
import { getDefaultSitePagesContent } from "@/lib/admin/site-pages-content";
import {
  FaqItem,
  HowToShopStep,
  SiteFaqContent,
  SiteHowToShopContent,
  SitePageContent,
  SitePageKey,
  SitePageSection,
  SitePagesContent,
} from "@/types";
import { cn } from "@/lib/utils";

const PAGE_OPTIONS: Array<{ key: SitePageKey; label: string }> = [
  { key: "shipping", label: "Shipping" },
  { key: "returns", label: "Returns" },
  { key: "faq", label: "FAQ" },
  { key: "howToShop", label: "How to Shop" },
  { key: "privacy", label: "Privacy" },
  { key: "terms", label: "Terms" },
];

function paragraphsToText(paragraphs: string[]) {
  return paragraphs.join("\n\n");
}

function textToParagraphs(value: string) {
  return value
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function bulletsToText(bullets?: string[]) {
  return (bullets ?? []).join("\n");
}

function textToBullets(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function SectionEditor({
  section,
  onChange,
  onRemove,
}: {
  section: SitePageSection;
  onChange: (section: SitePageSection) => void;
  onRemove: () => void;
}) {
  return (
    <div className="space-y-3 rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold">Section</p>
        <button
          type="button"
          onClick={onRemove}
          className="text-sm text-red-500 hover:underline"
        >
          Remove
        </button>
      </div>
      <Input
        id={`section-heading-${section.heading ?? "none"}`}
        label="Heading (optional)"
        value={section.heading ?? ""}
        onChange={(e) => onChange({ ...section, heading: e.target.value })}
      />
      <div>
        <label className="mb-2 block text-sm font-medium">Paragraphs</label>
        <textarea
          value={paragraphsToText(section.paragraphs)}
          onChange={(e) =>
            onChange({ ...section, paragraphs: textToParagraphs(e.target.value) })
          }
          rows={5}
          className={SITE_CONTENT_TEXTAREA_CLASS}
          placeholder="Separate paragraphs with a blank line"
        />
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium">Bullet points (optional)</label>
        <textarea
          value={bulletsToText(section.bullets)}
          onChange={(e) =>
            onChange({ ...section, bullets: textToBullets(e.target.value) })
          }
          rows={4}
          className={SITE_CONTENT_TEXTAREA_CLASS}
          placeholder="One bullet per line"
        />
      </div>
    </div>
  );
}

function ContentPageEditor({
  page,
  onChange,
}: {
  page: SitePageContent;
  onChange: (page: SitePageContent) => void;
}) {
  return (
    <div className="space-y-4">
      <Input
        id="trust-page-title"
        label="Page title"
        value={page.title}
        onChange={(e) => onChange({ ...page, title: e.target.value })}
      />
      <Input
        id="trust-page-description"
        label="Description"
        value={page.description}
        onChange={(e) => onChange({ ...page, description: e.target.value })}
      />
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold">Sections</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() =>
              onChange({
                ...page,
                sections: [...page.sections, { paragraphs: [""] }],
              })
            }
          >
            <Plus className="h-3.5 w-3.5" />
            Add section
          </Button>
        </div>
        {page.sections.map((section, index) => (
          <SectionEditor
            key={`section-${index}`}
            section={section}
            onChange={(next) =>
              onChange({
                ...page,
                sections: page.sections.map((item, i) =>
                  i === index ? next : item
                ),
              })
            }
            onRemove={() =>
              onChange({
                ...page,
                sections: page.sections.filter((_, i) => i !== index),
              })
            }
          />
        ))}
      </div>
    </div>
  );
}

function FaqEditor({
  page,
  onChange,
}: {
  page: SiteFaqContent;
  onChange: (page: SiteFaqContent) => void;
}) {
  const updateItem = (index: number, patch: Partial<FaqItem>) => {
    onChange({
      ...page,
      items: page.items.map((item, i) =>
        i === index ? { ...item, ...patch } : item
      ),
    });
  };

  return (
    <div className="space-y-4">
      <Input
        id="faq-title"
        label="Page title"
        value={page.title}
        onChange={(e) => onChange({ ...page, title: e.target.value })}
      />
      <Input
        id="faq-description"
        label="Description"
        value={page.description}
        onChange={(e) => onChange({ ...page, description: e.target.value })}
      />
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold">Questions</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              onChange({
                ...page,
                items: [...page.items, { question: "", answer: "" }],
              })
            }
          >
            Add question
          </Button>
        </div>
        {page.items.map((item, index) => (
          <div
            key={`faq-${index}`}
            className="space-y-2 rounded-xl border border-neutral-200 p-4 dark:border-neutral-800"
          >
            <Input
              id={`faq-q-${index}`}
              label={`Question ${index + 1}`}
              value={item.question}
              onChange={(e) => updateItem(index, { question: e.target.value })}
            />
            <textarea
              value={item.answer}
              onChange={(e) => updateItem(index, { answer: e.target.value })}
              rows={3}
              className={SITE_CONTENT_TEXTAREA_CLASS}
              placeholder="Answer"
            />
            <button
              type="button"
              onClick={() =>
                onChange({
                  ...page,
                  items: page.items.filter((_, i) => i !== index),
                })
              }
              className="inline-flex items-center gap-1 text-sm text-red-500 hover:underline"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function HowToShopEditor({
  page,
  onChange,
}: {
  page: SiteHowToShopContent;
  onChange: (page: SiteHowToShopContent) => void;
}) {
  const updateStep = (index: number, patch: Partial<HowToShopStep>) => {
    onChange({
      ...page,
      steps: page.steps.map((step, i) =>
        i === index ? { ...step, ...patch } : step
      ),
    });
  };

  return (
    <div className="space-y-4">
      <Input
        id="how-title"
        label="Page title"
        value={page.title}
        onChange={(e) => onChange({ ...page, title: e.target.value })}
      />
      <Input
        id="how-description"
        label="Description"
        value={page.description}
        onChange={(e) => onChange({ ...page, description: e.target.value })}
      />
      {page.steps.map((step, index) => (
        <div
          key={`step-${index}`}
          className="space-y-2 rounded-xl border border-neutral-200 p-4 dark:border-neutral-800"
        >
          <p className="text-sm font-semibold">Step {index + 1}</p>
          <Input
            id={`step-title-${index}`}
            label="Title"
            value={step.title}
            onChange={(e) => updateStep(index, { title: e.target.value })}
          />
          <textarea
            value={step.description}
            onChange={(e) => updateStep(index, { description: e.target.value })}
            rows={3}
            className={SITE_CONTENT_TEXTAREA_CLASS}
            placeholder="Description"
          />
        </div>
      ))}
      <Input
        id="how-cta-text"
        label="Bottom CTA text"
        value={page.ctaText}
        onChange={(e) => onChange({ ...page, ctaText: e.target.value })}
      />
      <Input
        id="how-cta-href"
        label="Bottom CTA link"
        value={page.ctaHref}
        onChange={(e) => onChange({ ...page, ctaHref: e.target.value })}
      />
    </div>
  );
}

export default function TrustPagesSectionEditor() {
  const { sitePages, updateSitePages, ready } = useCatalog();
  const [activePage, setActivePage] = useState<SitePageKey>("shipping");
  const [form, setForm] = useState<SitePagesContent>(sitePages);

  useEffect(() => {
    setForm(sitePages);
  }, [sitePages]);

  if (!ready) {
    return <div className="py-20 text-center text-neutral-400">Loading...</div>;
  }

  const save = () => updateSitePages(form);
  const reset = () => setForm(getDefaultSitePagesContent());

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {PAGE_OPTIONS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActivePage(key)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors",
              activePage === key
                ? "bg-primary text-white"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-900 dark:text-neutral-300"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
        {activePage === "faq" ? (
          <FaqEditor
            page={form.faq}
            onChange={(faq) => setForm({ ...form, faq })}
          />
        ) : activePage === "howToShop" ? (
          <HowToShopEditor
            page={form.howToShop}
            onChange={(howToShop) => setForm({ ...form, howToShop })}
          />
        ) : (
          <ContentPageEditor
            page={form[activePage]}
            onChange={(page) => setForm({ ...form, [activePage]: page })}
          />
        )}

        <SiteContentFormActions
          saveLabel="Save Trust Pages"
          onSave={save}
          onReset={reset}
        />
      </div>
    </div>
  );
}

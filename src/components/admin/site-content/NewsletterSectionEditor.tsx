"use client";

import { useEffect, useState } from "react";
import Input from "@/components/ui/Input";
import SiteContentFormActions, {
  SITE_CONTENT_TEXTAREA_CLASS,
} from "@/components/admin/site-content/SiteContentFormActions";
import { useCatalog } from "@/context/CatalogContext";
import { getDefaultHomepageContent } from "@/lib/admin/homepage-content";
import { NewsletterSection } from "@/types";

export default function NewsletterSectionEditor() {
  const { homepageContent, updateHomepageContent, ready } = useCatalog();
  const [form, setForm] = useState<NewsletterSection>(
    homepageContent.newsletter
  );

  useEffect(() => {
    setForm(homepageContent.newsletter);
  }, [homepageContent.newsletter]);

  if (!ready) {
    return <div className="py-20 text-center text-neutral-400">Loading...</div>;
  }

  const defaults = getDefaultHomepageContent().newsletter;

  return (
    <div className="max-w-2xl space-y-4 rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
      <Input
        id="newsletter-title"
        label="Heading"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
      />
      <div>
        <label htmlFor="newsletter-description" className="mb-2 block text-sm font-medium">
          Description
        </label>
        <textarea
          id="newsletter-description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={3}
          className={SITE_CONTENT_TEXTAREA_CLASS}
        />
      </div>
      <Input
        id="newsletter-placeholder"
        label="Email placeholder"
        value={form.placeholder}
        onChange={(e) => setForm({ ...form, placeholder: e.target.value })}
      />
      <Input
        id="newsletter-buttonLabel"
        label="Button label"
        value={form.buttonLabel}
        onChange={(e) => setForm({ ...form, buttonLabel: e.target.value })}
      />
      <Input
        id="newsletter-footnote"
        label="Footnote"
        value={form.footnote}
        onChange={(e) => setForm({ ...form, footnote: e.target.value })}
      />
      <Input
        id="newsletter-successMessage"
        label="Success message"
        value={form.successMessage}
        onChange={(e) => setForm({ ...form, successMessage: e.target.value })}
      />
      <SiteContentFormActions
        saveLabel="Save Newsletter"
        onSave={() => updateHomepageContent({ newsletter: form })}
        onReset={() => setForm(defaults)}
      />
    </div>
  );
}

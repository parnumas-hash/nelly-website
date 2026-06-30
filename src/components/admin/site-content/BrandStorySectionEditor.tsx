"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Input from "@/components/ui/Input";
import TextLink from "@/components/ui/TextLink";
import FooterLogoUpload from "@/components/admin/FooterLogoUpload";
import SiteContentFormActions, {
  SITE_CONTENT_TEXTAREA_CLASS,
} from "@/components/admin/site-content/SiteContentFormActions";
import { useCatalog } from "@/context/CatalogContext";
import { getDefaultHomepageContent } from "@/lib/admin/homepage-content";
import { shouldUnoptimize } from "@/lib/image-utils";
import { SITE_IMAGE_SPECS } from "@/lib/site-content-image-specs";
import { BrandStorySection } from "@/types";

export default function BrandStorySectionEditor() {
  const { homepageContent, updateHomepageContent, ready } = useCatalog();
  const [form, setForm] = useState<BrandStorySection>(
    homepageContent.brandStory
  );

  useEffect(() => {
    setForm(homepageContent.brandStory);
  }, [homepageContent.brandStory]);

  if (!ready) {
    return <div className="py-20 text-center text-neutral-400">Loading...</div>;
  }

  const defaults = getDefaultHomepageContent().brandStory;
  const previewImage = form.imageUrl || defaults.imageUrl;

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
        <FooterLogoUpload
          label="Story image"
          uploadLabel="Upload story image"
          aspectClass="aspect-[4/5]"
          maxWidthClass="max-w-full"
          imagePaddingClass="p-0"
          imageSpec={SITE_IMAGE_SPECS.brandStoryPortrait}
          logoUrl={form.imageUrl}
          onChange={(imageUrl) => setForm({ ...form, imageUrl })}
        />
        <Input
          id="brand-story-imageUrl"
          label="Image URL"
          value={form.imageUrl}
          onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
        />
        <Input
          id="brand-story-imageAlt"
          label="Image alt text"
          value={form.imageAlt}
          onChange={(e) => setForm({ ...form, imageAlt: e.target.value })}
        />
        <Input
          id="brand-story-eyebrow"
          label="Eyebrow"
          value={form.eyebrow}
          onChange={(e) => setForm({ ...form, eyebrow: e.target.value })}
        />
        <Input
          id="brand-story-title"
          label="Heading"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <div>
          <label htmlFor="brand-story-description" className="mb-2 block text-sm font-medium">
            Intro description
          </label>
          <textarea
            id="brand-story-description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            className={SITE_CONTENT_TEXTAREA_CLASS}
          />
        </div>
        <div>
          <label htmlFor="brand-story-body" className="mb-2 block text-sm font-medium">
            Body text
          </label>
          <textarea
            id="brand-story-body"
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            rows={4}
            className={SITE_CONTENT_TEXTAREA_CLASS}
          />
        </div>
        <Input
          id="brand-story-ctaLabel"
          label="Link label"
          value={form.ctaLabel}
          onChange={(e) => setForm({ ...form, ctaLabel: e.target.value })}
        />
        <Input
          id="brand-story-ctaHref"
          label="Link URL"
          value={form.ctaHref}
          onChange={(e) => setForm({ ...form, ctaHref: e.target.value })}
        />
        <SiteContentFormActions
          saveLabel="Save Brand Story"
          onSave={() => updateHomepageContent({ brandStory: form })}
          onReset={() => setForm(defaults)}
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800">
        <div className="grid items-center gap-8 bg-neutral-100 p-6 dark:bg-neutral-900 lg:grid-cols-2">
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-neutral-200 dark:bg-neutral-800">
            <Image
              src={previewImage}
              alt={form.imageAlt}
              fill
              className="object-cover"
              unoptimized={shouldUnoptimize(previewImage)}
            />
          </div>
          <div>
            <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.3em] text-primary">
              {form.eyebrow}
            </p>
            <h2 className="font-display text-2xl font-bold tracking-tight">{form.title}</h2>
            <p className="mt-3 text-sm text-neutral-500">{form.description}</p>
            <p className="mt-3 text-sm text-neutral-500">{form.body}</p>
            <TextLink href={form.ctaHref || "#"} className="mt-6 inline-block">
              {form.ctaLabel}
            </TextLink>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import TextLink from "@/components/ui/TextLink";
import FooterLogoUpload from "@/components/admin/FooterLogoUpload";
import { useCatalog } from "@/context/CatalogContext";
import { getDefaultAbout } from "@/lib/admin/storage";
import { BRAND_LOGO_HEIGHT, BRAND_LOGO_WIDTH } from "@/lib/brand-assets";
import { shouldUnoptimize } from "@/lib/image-utils";

export default function SiteContentAboutPage() {
  const { about, updateAbout, ready } = useCatalog();
  const [form, setForm] = useState(about);

  useEffect(() => {
    setForm(about);
  }, [about]);

  if (!ready) {
    return <div className="py-20 text-center text-neutral-400">Loading...</div>;
  }

  const save = () => updateAbout(form);
  const applyDefault = () => setForm(getDefaultAbout());
  const previewImage = form.imageUrl || getDefaultAbout().imageUrl;
  const paragraphs = form.body.split(/\n\n+/).filter(Boolean);

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
        <FooterLogoUpload
          label="About image"
          uploadLabel="Upload about image"
          aspectClass="aspect-[4/5]"
          maxWidthClass="max-w-full"
          imagePaddingClass="p-8 md:p-12"
          logoUrl={form.imageUrl}
          onChange={(imageUrl) => setForm({ ...form, imageUrl })}
        />
        <Input
          id="imageUrl"
          label="Image URL"
          value={form.imageUrl}
          onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
          placeholder="/images/logo.png"
        />
        <Input
          id="eyebrow"
          label="Eyebrow"
          value={form.eyebrow}
          onChange={(e) => setForm({ ...form, eyebrow: e.target.value })}
        />
        <Input
          id="title"
          label="Heading"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <div>
          <label
            htmlFor="body"
            className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
          >
            Body text
          </label>
          <textarea
            id="body"
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            rows={8}
            className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white"
            placeholder="Separate paragraphs with a blank line"
          />
          <p className="mt-1 text-xs text-neutral-400">
            Use a blank line between paragraphs.
          </p>
        </div>
        <Input
          id="ctaLabel"
          label="Link label"
          value={form.ctaLabel}
          onChange={(e) => setForm({ ...form, ctaLabel: e.target.value })}
        />
        <Input
          id="ctaHref"
          label="Link URL"
          value={form.ctaHref}
          onChange={(e) => setForm({ ...form, ctaHref: e.target.value })}
        />
        <div className="flex flex-wrap gap-3">
          <Button onClick={save}>Save About Us</Button>
          <Button type="button" variant="outline" onClick={applyDefault}>
            Reset to default
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800">
        <div className="grid items-center gap-8 bg-neutral-100 p-6 dark:bg-neutral-900 lg:grid-cols-2">
          <div className="flex aspect-[4/5] items-center justify-center rounded-2xl bg-white p-8 shadow-sm ring-1 ring-neutral-100 dark:bg-neutral-950 dark:ring-neutral-800 md:p-12">
            <Image
              src={previewImage}
              alt={form.title}
              width={BRAND_LOGO_WIDTH}
              height={BRAND_LOGO_HEIGHT}
              className="max-h-full max-w-full object-contain"
              unoptimized={shouldUnoptimize(previewImage)}
            />
          </div>
          <div>
            <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.3em] text-primary">
              {form.eyebrow}
            </p>
            <h2 className="font-display text-2xl font-bold tracking-tight text-neutral-900 dark:text-white md:text-3xl">
              {form.title}
            </h2>
            <div className="mt-4 space-y-3 text-sm leading-relaxed text-neutral-500">
              {paragraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
            <TextLink href={form.ctaHref || "#"} className="mt-6 inline-block">
              {form.ctaLabel}
            </TextLink>
          </div>
        </div>
        <p className="bg-neutral-50 px-4 py-2 text-xs text-neutral-500 dark:bg-neutral-900">
          Live preview — image centered in the white panel
        </p>
      </div>
    </div>
  );
}

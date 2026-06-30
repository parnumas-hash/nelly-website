"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import BannerImageUpload from "@/components/admin/BannerImageUpload";
import { useSiteContentSave } from "@/components/admin/AdminToast";
import { useCatalog } from "@/context/CatalogContext";
import { getDefaultBanner } from "@/lib/admin/storage";
import { HERO_BANNER_ASPECT } from "@/lib/brand-assets";
import { shouldUnoptimizeBanner } from "@/lib/image-utils";

export default function SiteContentBannerPage() {
  const { banner, updateBanner, ready } = useCatalog();
  const [form, setForm] = useState(banner);

  const saveWithToast = useSiteContentSave();

  useEffect(() => {
    setForm(banner);
  }, [banner]);

  if (!ready) {
    return <div className="py-20 text-center text-neutral-400">Loading...</div>;
  }

  const save = () => saveWithToast(() => updateBanner(form));
  const applyDefaultBanner = () => setForm(getDefaultBanner());
  const useImageBanner = !form.videoUrl?.trim();

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
        <Input
          id="eyebrow"
          label="Eyebrow"
          value={form.eyebrow}
          onChange={(e) => setForm({ ...form, eyebrow: e.target.value })}
        />
        <Input
          id="title"
          label="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <Input
          id="subtitle"
          label="Subtitle"
          value={form.subtitle}
          onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
        />
        <Input
          id="ctaLabel"
          label="Button Label"
          value={form.ctaLabel}
          onChange={(e) => setForm({ ...form, ctaLabel: e.target.value })}
        />
        <Input
          id="ctaHref"
          label="Button Link"
          value={form.ctaHref}
          onChange={(e) => setForm({ ...form, ctaHref: e.target.value })}
        />
        <Input
          id="videoUrl"
          label="Video URL"
          value={form.videoUrl}
          onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
          placeholder="Leave empty to use poster image only"
        />
        <BannerImageUpload
          posterUrl={form.posterUrl}
          onChange={(posterUrl) => setForm({ ...form, posterUrl })}
        />
        <Input
          id="posterUrl"
          label="Poster / Banner Image URL"
          value={form.posterUrl}
          onChange={(e) => setForm({ ...form, posterUrl: e.target.value })}
          placeholder="/images/hero-banner.jpg"
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) => setForm({ ...form, active: e.target.checked })}
            className="rounded text-primary"
          />
          Banner active
        </label>
        <Button onClick={save}>Save Banner</Button>
        <Button type="button" variant="outline" onClick={applyDefaultBanner}>
          Use new default banner
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800">
        <div
          className={`relative w-full bg-[#f7f3ee] ${useImageBanner ? "" : "min-h-[280px]"}`}
        >
          {form.posterUrl && (
            <div
              className="relative w-full"
              style={{ aspectRatio: HERO_BANNER_ASPECT }}
            >
              <Image
                src={form.posterUrl}
                alt="Banner preview"
                fill
                className={
                  useImageBanner
                    ? "object-contain object-center"
                    : "object-cover object-center opacity-60"
                }
                unoptimized={shouldUnoptimizeBanner(form.posterUrl)}
              />
            </div>
          )}
          {!useImageBanner && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white">
              <p className="text-[10px] uppercase tracking-[0.4em] text-white/80">
                {form.eyebrow}
              </p>
              <h2 className="mt-3 font-display text-2xl font-bold md:text-4xl">
                {form.title}
              </h2>
              <p className="mt-3 text-sm text-white/80">{form.subtitle}</p>
              <span className="mt-6 rounded-full bg-white px-6 py-2 text-sm font-medium text-black">
                {form.ctaLabel}
              </span>
            </div>
          )}
        </div>
        <p className="bg-neutral-50 px-4 py-2 text-xs text-neutral-500 dark:bg-neutral-900">
          Live preview
        </p>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import FooterLogoUpload from "@/components/admin/FooterLogoUpload";
import { useSiteContentSave } from "@/components/admin/AdminToast";
import { useCatalog } from "@/context/CatalogContext";
import { getDefaultFooter } from "@/lib/admin/storage";
import { BRAND_LOGO_HEIGHT, BRAND_LOGO_WIDTH } from "@/lib/brand-assets";
import { shouldUnoptimize } from "@/lib/image-utils";

export default function FooterSectionEditor() {
  const { footer, updateFooter, ready } = useCatalog();
  const [form, setForm] = useState(footer);

  useEffect(() => {
    setForm(footer);
  }, [footer]);

  const saveWithToast = useSiteContentSave();

  if (!ready) {
    return <div className="py-20 text-center text-neutral-400">Loading...</div>;
  }

  const save = () => saveWithToast(() => updateFooter(form));
  const applyDefault = () => setForm(getDefaultFooter());
  const previewLogo = form.logoUrl || getDefaultFooter().logoUrl;

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
        <FooterLogoUpload
          logoUrl={form.logoUrl}
          onChange={(logoUrl) => setForm({ ...form, logoUrl })}
        />
        <Input
          id="legalName"
          label="Line below logo"
          value={form.legalName}
          onChange={(e) => setForm({ ...form, legalName: e.target.value })}
          placeholder="NELLY GROUP CO., LTD."
        />
        <div>
          <label
            htmlFor="footer-description"
            className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
          >
            Description
          </label>
          <textarea
            id="footer-description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={4}
            className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white"
            placeholder="Short company description for the footer"
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <Button onClick={save}>Save Footer</Button>
          <Button type="button" variant="outline" onClick={applyDefault}>
            Reset to default
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800">
        <div className="bg-white p-8 dark:bg-neutral-950">
          <div className="mx-auto flex max-w-[300px] flex-col items-center text-center">
            <Link
              href="/"
              className="flex h-40 w-full items-center justify-center md:h-44"
              aria-label="Footer logo preview"
            >
              <Image
                src={previewLogo}
                alt={form.legalName}
                width={BRAND_LOGO_WIDTH}
                height={BRAND_LOGO_HEIGHT}
                className="max-h-full max-w-full object-contain"
                unoptimized={shouldUnoptimize(previewLogo)}
              />
            </Link>
            <p className="mt-2 w-full text-[10px] uppercase tracking-[0.15em] text-neutral-400">
              {form.legalName}
            </p>
            <p className="mt-4 text-sm leading-relaxed text-neutral-500">
              {form.description}
            </p>
          </div>
        </div>
        <p className="bg-neutral-50 px-4 py-2 text-xs text-neutral-500 dark:bg-neutral-900">
          Live preview — logo and text stay centered as a block
        </p>
      </div>
    </div>
  );
}

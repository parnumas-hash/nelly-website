"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import FooterLogoUpload from "@/components/admin/FooterLogoUpload";
import { useSiteContentSave } from "@/components/admin/AdminToast";
import { useCatalog } from "@/context/CatalogContext";
import { getDefaultFooterBranding } from "@/lib/admin/footer-content";
import { BRAND_LOGO_HEIGHT, BRAND_LOGO_WIDTH } from "@/lib/brand-assets";
import { shouldUnoptimize } from "@/lib/image-utils";
import {
  FooterBranding,
  FooterLink,
  FooterLinkColumn,
  FooterSocialLink,
} from "@/types";
import { cn } from "@/lib/utils";

const inputClass =
  "w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none dark:border-neutral-800 dark:bg-neutral-950";

function LinkListEditor({
  title,
  links,
  onChange,
}: {
  title: string;
  links: FooterLink[];
  onChange: (links: FooterLink[]) => void;
}) {
  const updateLink = (index: number, patch: Partial<FooterLink>) => {
    onChange(
      links.map((link, i) => (i === index ? { ...link, ...patch } : link))
    );
  };

  return (
    <div className="space-y-3 rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold">{title}</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1"
          onClick={() => onChange([...links, { label: "New link", href: "/" }])}
        >
          <Plus className="h-3.5 w-3.5" />
          Add link
        </Button>
      </div>
      {links.map((link, index) => (
        <div key={`${title}-${index}`} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
          <input
            value={link.label}
            onChange={(e) => updateLink(index, { label: e.target.value })}
            placeholder="Label"
            className={inputClass}
          />
          <input
            value={link.href}
            onChange={(e) => updateLink(index, { href: e.target.value })}
            placeholder="/shop or https://..."
            className={inputClass}
          />
          <button
            type="button"
            onClick={() => onChange(links.filter((_, i) => i !== index))}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-red-500 hover:bg-red-50"
            aria-label="Remove link"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

function ColumnEditor({
  column,
  onChange,
}: {
  column: FooterLinkColumn;
  onChange: (column: FooterLinkColumn) => void;
}) {
  return (
    <div className="space-y-3">
      <Input
        id={`column-${column.title}`}
        label="Column title"
        value={column.title}
        onChange={(e) => onChange({ ...column, title: e.target.value })}
      />
      <LinkListEditor
        title="Links"
        links={column.links}
        onChange={(links) => onChange({ ...column, links })}
      />
    </div>
  );
}

export default function FooterSectionEditor() {
  const { footer, updateFooter, ready } = useCatalog();
  const [form, setForm] = useState<FooterBranding>(footer);

  useEffect(() => {
    setForm(footer);
  }, [footer]);

  const saveWithToast = useSiteContentSave();

  if (!ready) {
    return <div className="py-20 text-center text-neutral-400">Loading...</div>;
  }

  const defaults = getDefaultFooterBranding();
  const save = () => saveWithToast(() => updateFooter(form));
  const applyDefault = () => setForm(defaults);
  const previewLogo = form.logoUrl || defaults.logoUrl;

  const updateSocial = (index: number, patch: Partial<FooterSocialLink>) => {
    setForm({
      ...form,
      socialLinks: form.socialLinks.map((link, i) =>
        i === index ? { ...link, ...patch } : link
      ),
    });
  };

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
            className={cn(inputClass, "px-4 py-3")}
            placeholder="Short company description for the footer"
          />
        </div>

        <div className="space-y-4 border-t border-neutral-200 pt-4 dark:border-neutral-800">
          <p className="text-sm font-semibold">Social links</p>
          {form.socialLinks.map((link, index) => (
            <div key={link.platform} className="grid gap-2 sm:grid-cols-2">
              <Input
                id={`social-label-${link.platform}`}
                label={link.platform}
                value={link.label}
                onChange={(e) => updateSocial(index, { label: e.target.value })}
              />
              <Input
                id={`social-href-${link.platform}`}
                label="URL"
                value={link.href}
                onChange={(e) => updateSocial(index, { href: e.target.value })}
                placeholder={
                  link.platform === "email"
                    ? "mailto:hello@nellygroup.com"
                    : "https://..."
                }
              />
            </div>
          ))}
        </div>

        <ColumnEditor
          column={form.columns.shop}
          onChange={(shop) => setForm({ ...form, columns: { ...form.columns, shop } })}
        />
        <ColumnEditor
          column={form.columns.company}
          onChange={(company) =>
            setForm({ ...form, columns: { ...form.columns, company } })
          }
        />
        <ColumnEditor
          column={form.columns.support}
          onChange={(support) =>
            setForm({ ...form, columns: { ...form.columns, support } })
          }
        />

        <Input
          id="footer-copyright"
          label="Copyright line"
          value={form.copyrightText}
          onChange={(e) => setForm({ ...form, copyrightText: e.target.value })}
        />

        <LinkListEditor
          title="Legal links"
          links={form.legalLinks}
          onChange={(legalLinks) => setForm({ ...form, legalLinks })}
        />

        <p className="text-xs text-neutral-400">
          The Brands column is filled automatically from active brands in your
          catalog.
        </p>

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
          Live preview — logo and text block
        </p>
      </div>
    </div>
  );
}

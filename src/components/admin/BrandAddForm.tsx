"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useCatalog } from "@/context/CatalogContext";
import { BrandFormData } from "@/types";
import { slugify } from "@/lib/utils";

const emptyForm: BrandFormData = {
  displayName: "",
  slug: "",
  tagline: "",
  description: "",
  image: "",
  hasCustomImage: false,
  active: true,
};

interface BrandAddFormProps {
  onAdded?: () => void;
}

export default function BrandAddForm({ onAdded }: BrandAddFormProps) {
  const { addBrand } = useCatalog();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<BrandFormData>(emptyForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const update = <K extends keyof BrandFormData>(
    key: K,
    value: BrandFormData[K]
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.displayName.trim()) {
      setError("Display name is required.");
      return;
    }

    setSaving(true);
    try {
      addBrand(form);
      setForm(emptyForm);
      setOpen(false);
      onAdded?.();
    } catch {
      setError("Could not save brand. Check storage space and try again.");
    } finally {
      setSaving(false);
    }
  };

  if (!open) {
    return (
      <Button
        type="button"
        className="gap-2"
        onClick={() => setOpen(true)}
      >
        <Plus className="h-4 w-4" />
        Add Brand
      </Button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-8 rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900"
    >
      <h2 className="text-lg font-semibold tracking-tight">Add Brand</h2>
      <p className="mt-1 text-sm text-neutral-500">
        Create a new partner brand for the storefront and product catalog.
      </p>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <Input
          id="brand-display-name"
          label="Display Name"
          value={form.displayName}
          onChange={(e) => update("displayName", e.target.value)}
          placeholder="e.g. MANDARINE BROTHERS"
          required
        />

        <div>
          <div className="mb-2 flex items-end justify-between gap-2">
            <label htmlFor="brand-slug" className="block text-sm font-medium">
              URL Slug
            </label>
            <button
              type="button"
              onClick={() =>
                update("slug", slugify(form.displayName) || form.slug)
              }
              className="text-xs text-primary hover:underline"
            >
              Generate from name
            </button>
          </div>
          <Input
            id="brand-slug"
            value={form.slug}
            onChange={(e) => update("slug", slugify(e.target.value))}
            placeholder="mandarine-brothers"
          />
          {form.slug && (
            <p className="mt-1 text-xs text-neutral-500">
              Shop filter: /shop?brand={form.slug}
            </p>
          )}
        </div>

        <Input
          id="brand-tagline"
          label="Tagline"
          value={form.tagline}
          onChange={(e) => update("tagline", e.target.value)}
          placeholder="e.g. Refined Pet Fashion"
        />

        <div className="md:col-span-2">
          <label
            htmlFor="brand-description"
            className="mb-2 block text-sm font-medium"
          >
            Description
          </label>
          <textarea
            id="brand-description"
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            rows={3}
            placeholder="Short brand story for brand pages and SEO."
            className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm dark:border-neutral-800 dark:bg-neutral-950"
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) => update("active", e.target.checked)}
            className="rounded border-neutral-300 text-primary focus:ring-primary"
          />
          Active on storefront
        </label>
      </div>

      {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

      <div className="mt-5 flex flex-wrap gap-2">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Create Brand"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setOpen(false);
            setForm(emptyForm);
            setError("");
          }}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

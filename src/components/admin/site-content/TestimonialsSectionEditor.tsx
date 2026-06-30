"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Plus, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import FooterLogoUpload from "@/components/admin/FooterLogoUpload";
import SiteContentFormActions, {
  SITE_CONTENT_TEXTAREA_CLASS,
} from "@/components/admin/site-content/SiteContentFormActions";
import { useCatalog } from "@/context/CatalogContext";
import { generateId } from "@/lib/admin/storage";
import { getDefaultHomepageContent } from "@/lib/admin/homepage-content";
import { shouldUnoptimize } from "@/lib/image-utils";
import { SITE_IMAGE_SPECS } from "@/lib/site-content-image-specs";
import { Testimonial, TestimonialsSection } from "@/types";

export default function TestimonialsSectionEditor() {
  const { homepageContent, updateHomepageContent, ready } = useCatalog();
  const [form, setForm] = useState<TestimonialsSection>(
    homepageContent.testimonials
  );

  useEffect(() => {
    setForm(homepageContent.testimonials);
  }, [homepageContent.testimonials]);

  if (!ready) {
    return <div className="py-20 text-center text-neutral-400">Loading...</div>;
  }

  const defaults = getDefaultHomepageContent().testimonials;

  const updateItem = (index: number, patch: Partial<Testimonial>) => {
    setForm((current) => ({
      ...current,
      items: current.items.map((item, i) =>
        i === index ? { ...item, ...patch } : item
      ),
    }));
  };

  const addItem = () => {
    setForm((current) => ({
      ...current,
      items: [
        ...current.items,
        {
          id: generateId(),
          name: "New reviewer",
          role: "Pet parent",
          content: "Share a customer quote here.",
          rating: 5,
          avatar: defaults.items[0]?.avatar ?? "",
        },
      ],
    }));
  };

  const removeItem = (index: number) => {
    setForm((current) => ({
      ...current,
      items: current.items.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900 md:grid-cols-3">
        <Input
          id="testimonials-eyebrow"
          label="Eyebrow"
          value={form.eyebrow}
          onChange={(e) => setForm({ ...form, eyebrow: e.target.value })}
        />
        <Input
          id="testimonials-title"
          label="Heading"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <Input
          id="testimonials-description"
          label="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </div>

      <div className="space-y-4">
        {form.items.map((item, index) => (
          <div
            key={item.id}
            className="grid gap-4 rounded-2xl border border-neutral-200 p-5 dark:border-neutral-800 lg:grid-cols-[160px_1fr]"
          >
            <div>
              <FooterLogoUpload
                label="Avatar"
                uploadLabel="Upload avatar"
                aspectClass="aspect-square"
                maxWidthClass="max-w-[160px]"
                imagePaddingClass="p-0"
                imageSpec={SITE_IMAGE_SPECS.avatarSquare}
                logoUrl={item.avatar}
                onChange={(avatar) => updateItem(index, { avatar })}
              />
              <div className="relative mt-3 aspect-square w-20 overflow-hidden rounded-full">
                {item.avatar ? (
                  <Image
                    src={item.avatar}
                    alt={item.name}
                    fill
                    className="object-cover"
                    unoptimized={shouldUnoptimize(item.avatar)}
                  />
                ) : null}
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold">Review {index + 1}</p>
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-100 hover:text-red-500 dark:hover:bg-neutral-900"
                  aria-label="Remove review"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <Input
                id={`testimonial-name-${index}`}
                label="Name"
                value={item.name}
                onChange={(e) => updateItem(index, { name: e.target.value })}
              />
              <Input
                id={`testimonial-role-${index}`}
                label="Role"
                value={item.role}
                onChange={(e) => updateItem(index, { role: e.target.value })}
              />
              <div>
                <label htmlFor={`testimonial-content-${index}`} className="mb-2 block text-sm font-medium">
                  Quote
                </label>
                <textarea
                  id={`testimonial-content-${index}`}
                  value={item.content}
                  onChange={(e) => updateItem(index, { content: e.target.value })}
                  rows={4}
                  className={SITE_CONTENT_TEXTAREA_CLASS}
                />
              </div>
              <Input
                id={`testimonial-rating-${index}`}
                label="Rating (1-5)"
                type="number"
                min={1}
                max={5}
                value={item.rating}
                onChange={(e) =>
                  updateItem(index, { rating: Number(e.target.value) || 5 })
                }
              />
              <Input
                id={`testimonial-avatar-${index}`}
                label="Avatar URL"
                value={item.avatar}
                onChange={(e) => updateItem(index, { avatar: e.target.value })}
              />
            </div>
          </div>
        ))}
      </div>

      <Button type="button" variant="outline" onClick={addItem} className="gap-2">
        <Plus className="h-4 w-4" />
        Add review
      </Button>

      <SiteContentFormActions
        saveLabel="Save Testimonials"
        onSave={() => updateHomepageContent({ testimonials: form })}
        onReset={() => setForm(defaults)}
      />
    </div>
  );
}

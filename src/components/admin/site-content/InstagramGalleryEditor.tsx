"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Plus, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import FooterLogoUpload from "@/components/admin/FooterLogoUpload";
import SiteContentFormActions from "@/components/admin/site-content/SiteContentFormActions";
import { useCatalog } from "@/context/CatalogContext";
import { generateId } from "@/lib/admin/storage";
import { getDefaultHomepageContent } from "@/lib/admin/homepage-content";
import { shouldUnoptimize } from "@/lib/image-utils";
import { SITE_IMAGE_SPECS } from "@/lib/site-content-image-specs";
import { InstagramGallerySection, InstagramPost } from "@/types";

export default function InstagramGalleryEditor() {
  const { homepageContent, updateHomepageContent, ready } = useCatalog();
  const [form, setForm] = useState<InstagramGallerySection>(
    homepageContent.instagram
  );

  useEffect(() => {
    setForm(homepageContent.instagram);
  }, [homepageContent.instagram]);

  if (!ready) {
    return <div className="py-20 text-center text-neutral-400">Loading...</div>;
  }

  const defaults = getDefaultHomepageContent().instagram;

  const updatePost = (index: number, patch: Partial<InstagramPost>) => {
    setForm((current) => ({
      ...current,
      posts: current.posts.map((post, i) =>
        i === index ? { ...post, ...patch } : post
      ),
    }));
  };

  const addPost = () => {
    setForm((current) => ({
      ...current,
      posts: [
        ...current.posts,
        {
          id: generateId(),
          image: defaults.posts[0]?.image ?? "",
          alt: "Instagram post",
          href: form.profileHref,
        },
      ],
    }));
  };

  const removePost = (index: number) => {
    setForm((current) => ({
      ...current,
      posts: current.posts.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900 md:grid-cols-2">
        <Input
          id="instagram-title"
          label="Heading"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <Input
          id="instagram-description"
          label="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <Input
          id="instagram-profileHref"
          label="Profile link"
          value={form.profileHref}
          onChange={(e) => setForm({ ...form, profileHref: e.target.value })}
        />
        <Input
          id="instagram-profileLabel"
          label="Profile link label"
          value={form.profileLabel}
          onChange={(e) => setForm({ ...form, profileLabel: e.target.value })}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {form.posts.map((post, index) => (
          <div
            key={post.id}
            className="space-y-3 rounded-2xl border border-neutral-200 p-4 dark:border-neutral-800"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Post {index + 1}</p>
              <button
                type="button"
                onClick={() => removePost(index)}
                className="rounded-lg p-2 text-neutral-400 hover:text-red-500"
                aria-label="Remove post"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <FooterLogoUpload
              label="Image"
              uploadLabel="Upload image"
              aspectClass="aspect-square"
              maxWidthClass="max-w-full"
              imagePaddingClass="p-0"
              imageSpec={SITE_IMAGE_SPECS.instagramSquare}
              logoUrl={post.image}
              onChange={(image) => updatePost(index, { image })}
            />
            <div className="relative aspect-square overflow-hidden rounded-xl bg-neutral-100">
              {post.image ? (
                <Image
                  src={post.image}
                  alt={post.alt}
                  fill
                  className="object-cover"
                  unoptimized={shouldUnoptimize(post.image)}
                />
              ) : null}
            </div>
            <Input
              id={`instagram-alt-${index}`}
              label="Alt text"
              value={post.alt}
              onChange={(e) => updatePost(index, { alt: e.target.value })}
            />
            <Input
              id={`instagram-href-${index}`}
              label="Post link"
              value={post.href}
              onChange={(e) => updatePost(index, { href: e.target.value })}
            />
          </div>
        ))}
      </div>

      <Button type="button" variant="outline" onClick={addPost} className="gap-2">
        <Plus className="h-4 w-4" />
        Add post
      </Button>

      <SiteContentFormActions
        saveLabel="Save Instagram Gallery"
        onSave={() => updateHomepageContent({ instagram: form })}
        onReset={() => setForm(defaults)}
      />
    </div>
  );
}

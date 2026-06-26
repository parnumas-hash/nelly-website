"use client";

import Link from "next/link";
import Image from "next/image";
import { BrandCategory } from "@/types";
import { useCatalog } from "@/context/CatalogContext";
import { resolveCategoryImageUrl, shouldUnoptimize } from "@/lib/image-utils";

interface CategoryCardProps {
  category: BrandCategory;
  brandSlug: string;
  petType: "dog" | "cat";
}

export default function CategoryCard({
  category,
  brandSlug,
  petType,
}: CategoryCardProps) {
  const { getMediaUrl } = useCatalog();
  const imageUrl = resolveCategoryImageUrl(category, getMediaUrl);

  const href = `/shop?brand=${brandSlug}&petType=${petType}&category=${category.slug}`;

  return (
    <Link
      href={href}
      className="group block overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-neutral-100 transition-all duration-500 hover:-translate-y-0.5 hover:shadow-lg hover:ring-neutral-200 dark:bg-neutral-900 dark:ring-neutral-800"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-neutral-50 dark:bg-neutral-800/80">
        <Image
          src={imageUrl}
          alt={category.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          unoptimized={shouldUnoptimize(imageUrl)}
        />
      </div>
      <div className="p-4">
        <h3 className="text-sm font-semibold tracking-wide text-neutral-900 dark:text-white">
          {category.name}
        </h3>
      </div>
    </Link>
  );
}

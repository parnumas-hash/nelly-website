"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Brand } from "@/types";
import { getBrandDisplayImage, shouldUnoptimize } from "@/lib/image-utils";

interface BrandCardProps {
  brand: Brand & { hasCustomImage?: boolean };
  index?: number;
}

function BrandInitialPlaceholder({ name }: { name: string }) {
  return (
    <div className="flex aspect-square w-full items-center justify-center bg-neutral-50 dark:bg-neutral-800/80">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-xl font-display font-semibold tracking-wide text-neutral-300 shadow-sm ring-1 ring-neutral-100 dark:bg-neutral-900 dark:ring-neutral-700">
        {name.charAt(0)}
      </span>
    </div>
  );
}

export default function BrandCard({ brand, index = 0 }: BrandCardProps) {
  const imageSrc = getBrandDisplayImage(brand);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06, duration: 0.5 }}
    >
      <Link
        href={`/brands/${brand.slug}`}
        className="group block overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-neutral-100 transition-all duration-500 hover:shadow-lg hover:ring-neutral-200 dark:bg-neutral-900 dark:ring-neutral-800 dark:hover:ring-neutral-700"
      >
        {imageSrc ? (
          <div className="relative aspect-square overflow-hidden bg-neutral-50 dark:bg-neutral-800/80">
            <Image
              src={imageSrc}
              alt={brand.displayName}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-contain p-4 transition-transform duration-700 group-hover:scale-[1.02]"
              unoptimized={shouldUnoptimize(imageSrc)}
            />
          </div>
        ) : (
          <BrandInitialPlaceholder name={brand.displayName} />
        )}
        <div className="p-5">
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-primary">
            {brand.tagline}
          </p>
          <h3 className="mt-1 text-sm font-semibold tracking-wide text-neutral-900 dark:text-white">
            {brand.displayName}
          </h3>
          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-neutral-500">
            {brand.description}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}

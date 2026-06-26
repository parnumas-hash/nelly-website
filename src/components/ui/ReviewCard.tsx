"use client";

import Image from "next/image";
import { Star } from "lucide-react";
import { motion } from "framer-motion";
import { Testimonial } from "@/types";

interface ReviewCardProps {
  testimonial: Testimonial;
  index?: number;
}

export default function ReviewCard({
  testimonial,
  index = 0,
}: ReviewCardProps) {
  return (
    <motion.blockquote
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.08, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      className="flex h-full flex-col rounded-2xl bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] ring-1 ring-neutral-200/80 dark:bg-neutral-900 dark:ring-neutral-800"
    >
      <div className="mb-4 flex gap-0.5" aria-label={`${testimonial.rating} out of 5 stars`}>
        {Array.from({ length: testimonial.rating }).map((_, i) => (
          <Star key={i} className="h-3.5 w-3.5 fill-primary text-primary" />
        ))}
      </div>
      <p className="flex-1 text-[15px] leading-relaxed text-neutral-600 dark:text-neutral-400">
        &ldquo;{testimonial.content}&rdquo;
      </p>
      <footer className="mt-6 flex items-center gap-3 border-t border-neutral-100 pt-5 dark:border-neutral-800">
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full ring-2 ring-neutral-100 dark:ring-neutral-800">
          <Image
            src={testimonial.avatar}
            alt={testimonial.name}
            fill
            className="object-cover"
            sizes="40px"
          />
        </div>
        <div>
          <cite className="not-italic text-sm font-semibold text-neutral-900 dark:text-white">
            {testimonial.name}
          </cite>
          <p className="text-xs text-neutral-500">{testimonial.role}</p>
        </div>
      </footer>
    </motion.blockquote>
  );
}

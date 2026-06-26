"use client";

import { Instagram } from "lucide-react";
import { motion } from "framer-motion";
import SafeImage from "@/components/ui/SafeImage";
import { sanitizeImageUrl } from "@/lib/image-utils";

export interface InstagramPost {
  id: string;
  image: string;
  alt: string;
  href: string;
}

interface InstagramTileProps {
  post: InstagramPost;
  index?: number;
}

export default function InstagramTile({ post, index = 0 }: InstagramTileProps) {
  return (
    <motion.a
      href={post.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`View on Instagram: ${post.alt}`}
      initial={{ opacity: 0, scale: 0.98 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="group relative block aspect-square overflow-hidden bg-neutral-100"
    >
      <SafeImage
        src={sanitizeImageUrl(post.image)}
        alt={post.alt}
        fill
        sizes="(max-width: 768px) 50vw, 16vw"
        className="object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-300 group-hover:bg-black/30">
        <Instagram className="h-8 w-8 scale-75 text-white opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100" />
      </div>
    </motion.a>
  );
}

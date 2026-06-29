"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import SafeImage from "@/components/ui/SafeImage";
import { cn } from "@/lib/utils";

interface ProductImageZoomProps {
  src: string;
  alt: string;
  /** Reset zoom when the active image changes */
  imageKey?: string;
  priority?: boolean;
  className?: string;
  children?: React.ReactNode;
}

/** Full-resolution image for lightbox — avoids Next.js fill + CSS transform blur. */
function ZoomedProductImage({ src, alt }: { src: string; alt: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      draggable={false}
      decoding="async"
      className="max-h-[92vh] max-w-[min(96vw,72rem)] object-contain"
    />
  );
}

export default function ProductImageZoom({
  src,
  alt,
  imageKey,
  priority = false,
  className,
  children,
}: ProductImageZoomProps) {
  const [expanded, setExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setExpanded(false);
  }, [imageKey, src]);

  useEffect(() => {
    if (!expanded) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setExpanded(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [expanded]);

  const toggleExpanded = () => {
    if (!src) return;
    setExpanded((open) => !open);
  };

  const lightbox =
    mounted &&
    createPortal(
      <AnimatePresence>
        {expanded && src && (
          <motion.div
            role="presentation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] flex cursor-zoom-out items-center justify-center bg-black/90 p-4 md:p-10"
            onClick={() => setExpanded(false)}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            onClick={(event) => event.stopPropagation()}
            className="cursor-zoom-out"
          >
            <button
              type="button"
              onClick={() => setExpanded(false)}
              aria-label="Close enlarged image"
            >
              <ZoomedProductImage src={src} alt={alt} />
            </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body
    );

  return (
    <>
      <div
        className={cn(
          "relative aspect-square overflow-hidden rounded-3xl bg-[#faf8f5] p-6 ring-1 ring-neutral-100 md:p-8 dark:bg-neutral-950 dark:ring-neutral-800",
          className
        )}
      >
        {src ? (
          <button
            type="button"
            onClick={toggleExpanded}
            className="relative h-full w-full cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            aria-label="Enlarge product image"
            aria-expanded={expanded}
          >
            <SafeImage
              src={src}
              alt={alt}
              fill
              priority={priority}
              unoptimized
              className="object-contain object-center"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </button>
        ) : (
          <div className="flex h-full items-center justify-center text-neutral-400">
            No image
          </div>
        )}
        {children}
      </div>

      {lightbox}
    </>
  );
}

"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import Button from "@/components/ui/Button";
import { useCatalog } from "@/context/CatalogContext";
import { loadBanner } from "@/lib/admin/storage";

export default function HeroVideo() {
  const prefersReducedMotion = useReducedMotion();
  const { banner: catalogBanner, ready } = useCatalog();
  const banner = { ...loadBanner(), ...catalogBanner };

  const fade = (delay: number) =>
    prefersReducedMotion
      ? {}
      : {
          initial: { opacity: 0, y: 16 },
          animate: { opacity: 1, y: 0 },
          transition: { delay, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
        };

  if (!ready) {
    return (
      <section className="relative -mt-16 min-h-[100svh] bg-neutral-900 md:-mt-20" />
    );
  }

  if (!banner.active) return null;

  return (
    <section
      aria-label={banner.title}
      className="relative -mt-16 min-h-[100svh] overflow-hidden md:-mt-20"
    >
      <video
        autoPlay
        muted
        loop
        playsInline
        poster={banner.posterUrl}
        className="absolute inset-0 h-full w-full object-cover"
        aria-hidden
      >
        <source src={banner.videoUrl} type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/65" />

      <div className="relative flex min-h-[100svh] flex-col items-center justify-center px-4 pb-20 pt-32 text-center md:px-6 md:pt-36">
        <motion.p
          {...fade(0.15)}
          className="text-[11px] font-semibold uppercase tracking-[0.45em] text-white/90"
        >
          {banner.eyebrow}
        </motion.p>

        <motion.h1
          {...fade(0.3)}
          className="mt-5 max-w-4xl font-display text-[40px] font-bold leading-[1.1] tracking-tight text-white md:text-[64px] lg:text-[72px]"
        >
          {banner.title}
        </motion.h1>

        <motion.p
          {...fade(0.45)}
          className="mx-auto mt-6 max-w-xl text-[17px] font-light leading-relaxed text-white/85 md:text-[21px]"
        >
          {banner.subtitle}
        </motion.p>

        <motion.div {...fade(0.6)} className="mt-10">
          <Link href={banner.ctaHref}>
            <Button
              size="lg"
              className="min-w-[200px] gap-2 bg-white text-neutral-900 hover:bg-neutral-100"
            >
              {banner.ctaLabel}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </motion.div>

        <motion.a
          href="#brands"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="absolute bottom-10 flex flex-col items-center gap-2 text-white/50 transition-colors hover:text-white"
          aria-label="Scroll to shop by brand"
        >
          <span className="text-[10px] uppercase tracking-[0.25em]">Scroll</span>
          <ChevronDown className="h-5 w-5 animate-bounce" />
        </motion.a>
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import Button from "@/components/ui/Button";

export default function Hero() {
  const prefersReducedMotion = useReducedMotion();

  const fade = (delay: number) =>
    prefersReducedMotion
      ? {}
      : {
          initial: { opacity: 0, y: 16 },
          animate: { opacity: 1, y: 0 },
          transition: { delay, duration: 0.55, ease: [0.25, 0.1, 0.25, 1] },
        };

  return (
    <section
      aria-label="Hero"
      className="relative flex min-h-[85vh] items-center justify-center overflow-hidden bg-white dark:bg-neutral-950"
    >
      <div className="pointer-events-none absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=1920&q=80"
          alt=""
          fill
          priority
          className="object-cover opacity-[0.07] dark:opacity-[0.12]"
          sizes="100vw"
        />
      </div>

      <div className="relative mx-auto max-w-3xl px-4 py-24 text-center md:px-6">
        <motion.p
          {...fade(0.1)}
          className="text-[11px] font-medium uppercase tracking-[0.4em] text-primary"
        >
          NELLY GROUP
        </motion.p>

        <motion.h1
          {...fade(0.22)}
          className="mt-5 font-display text-[44px] font-bold leading-[1.08] tracking-tight text-neutral-900 dark:text-white md:text-[64px] lg:text-[72px]"
        >
          Luxury Pet Lifestyle
        </motion.h1>

        <motion.p
          {...fade(0.38)}
          className="mx-auto mt-6 max-w-md text-[17px] leading-relaxed text-neutral-500 md:text-[19px]"
        >
          Discover Premium Brands
        </motion.p>

        <motion.div {...fade(0.52)} className="mt-10">
          <Link href="/shop">
            <Button size="lg" className="min-w-[160px]">
              Shop Now
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

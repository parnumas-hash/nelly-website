"use client";

import { Shield, Truck, Award, Headphones } from "lucide-react";
import FadeIn from "@/components/ui/FadeIn";
import SectionHeader from "@/components/ui/SectionHeader";
import { formatPrice, FREE_SHIPPING_MIN } from "@/lib/utils";

const reasons = [
  {
    icon: Award,
    title: "Curated Premium Brands",
    description:
      "Every brand in our collection is hand-selected for exceptional quality, design integrity, and proven customer satisfaction.",
  },
  {
    icon: Shield,
    title: "Authenticity Guaranteed",
    description:
      "100% genuine products sourced directly from authorized distributors. No counterfeits, ever.",
  },
  {
    icon: Truck,
    title: "Complimentary Shipping",
    description:
      `Free express delivery on orders over ${formatPrice(FREE_SHIPPING_MIN)}. Carefully packaged to arrive in perfect condition.`,
  },
  {
    icon: Headphones,
    title: "Personal Concierge",
    description:
      "Dedicated support from pet lifestyle experts who understand what your companion truly needs.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <SectionHeader
          eyebrow="The NELLY Difference"
          title="Why Choose NELLY GROUP"
          description="We elevate pet retail to an art form — combining world-class brands with an uncompromising commitment to quality and service."
          align="center"
        />

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {reasons.map((reason, i) => (
            <FadeIn key={reason.title} delay={i * 0.1}>
              <div className="group rounded-2xl border border-neutral-100 bg-white p-8 text-center transition-all duration-500 hover:border-primary/20 hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-primary/30">
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/5 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                  <reason.icon className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                  {reason.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-neutral-500">
                  {reason.description}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

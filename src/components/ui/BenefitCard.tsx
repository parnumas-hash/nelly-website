"use client";

import { LucideIcon } from "lucide-react";
import FadeIn from "@/components/ui/FadeIn";

interface BenefitCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  index?: number;
}

export default function BenefitCard({
  icon: Icon,
  title,
  description,
  index = 0,
}: BenefitCardProps) {
  return (
    <FadeIn delay={index * 0.08}>
      <div className="group h-full rounded-2xl border border-neutral-200/80 bg-white p-8 text-center transition-all duration-500 hover:border-primary/20 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-primary/30">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/5 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-white">
          <Icon className="h-6 w-6" strokeWidth={1.5} />
        </div>
        <h3 className="text-[17px] font-semibold tracking-tight text-neutral-900 dark:text-white">
          {title}
        </h3>
        <p className="mt-3 text-[15px] leading-relaxed text-neutral-500">
          {description}
        </p>
      </div>
    </FadeIn>
  );
}

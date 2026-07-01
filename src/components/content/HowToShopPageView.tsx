"use client";

import Link from "next/link";
import ContentPageLayout from "@/components/content/ContentPageLayout";
import Button from "@/components/ui/Button";
import { useCatalog } from "@/context/CatalogContext";

export default function HowToShopPageView() {
  const { sitePages, ready } = useCatalog();

  if (!ready) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center text-neutral-400">
        Loading...
      </div>
    );
  }

  const page = sitePages.howToShop;

  return (
    <ContentPageLayout
      eyebrow="Guide"
      title={page.title}
      description={page.description}
    >
      <ol className="space-y-6">
        {page.steps.map((step) => (
          <li
            key={step.step}
            className="flex gap-5 rounded-2xl border border-neutral-200 p-6 dark:border-neutral-800"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
              {step.step}
            </span>
            <div>
              <h2 className="font-semibold text-neutral-900 dark:text-white">
                {step.title}
              </h2>
              <p className="mt-2 text-[15px] leading-relaxed text-neutral-600 dark:text-neutral-400">
                {step.description}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <div className="rounded-2xl bg-neutral-50 p-8 text-center dark:bg-neutral-900/50">
        <p className="text-neutral-600 dark:text-neutral-400">{page.ctaText}</p>
        <Link href={page.ctaHref} className="mt-4 inline-block">
          <Button size="lg">Start Shopping</Button>
        </Link>
      </div>
    </ContentPageLayout>
  );
}

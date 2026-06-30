import type { Metadata } from "next";
import Link from "next/link";
import ContentPageLayout from "@/components/content/ContentPageLayout";
import { howToShopSteps } from "@/lib/site-pages";
import Button from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "How to Shop",
  description:
    "A simple guide to discovering, choosing, and ordering premium pet products from NELLY GROUP.",
};

export default function HowToShopPage() {
  return (
    <ContentPageLayout
      eyebrow="Guide"
      title="How to Shop"
      description="Four simple steps to find the perfect pieces for your companion."
    >
      <ol className="space-y-6">
        {howToShopSteps.map((step) => (
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
        <p className="text-neutral-600 dark:text-neutral-400">
          Ready to explore our curated collection?
        </p>
        <Link href="/shop" className="mt-4 inline-block">
          <Button size="lg">Start Shopping</Button>
        </Link>
      </div>
    </ContentPageLayout>
  );
}

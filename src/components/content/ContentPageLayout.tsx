import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import PageTransition from "@/components/ui/PageTransition";

interface ContentPageLayoutProps {
  eyebrow?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}

export default function ContentPageLayout({
  eyebrow = "Support",
  title,
  description,
  children,
}: ContentPageLayoutProps) {
  return (
    <PageTransition>
      <div className="mx-auto max-w-3xl px-4 py-8 md:px-6 md:py-14">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-neutral-500 transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <header className="mb-10">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.3em] text-primary">
            {eyebrow}
          </p>
          <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-4 text-[17px] leading-relaxed text-neutral-500">
              {description}
            </p>
          ) : null}
        </header>

        <div className="space-y-10">{children}</div>
      </div>
    </PageTransition>
  );
}

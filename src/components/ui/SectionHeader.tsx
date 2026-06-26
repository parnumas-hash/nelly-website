import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
  align?: "left" | "center";
  className?: string;
}

export default function SectionHeader({
  eyebrow,
  title,
  description,
  href,
  linkLabel = "View All",
  align = "left",
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "mb-10 md:mb-14",
        align === "center" && "text-center",
        className
      )}
    >
      {eyebrow && (
        <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.25em] text-primary">
          {eyebrow}
        </p>
      )}
      <div
        className={cn(
          "flex flex-col gap-4",
          align === "left" &&
            href &&
            "md:flex-row md:items-end md:justify-between"
        )}
      >
        <div className={cn(align === "center" && "mx-auto max-w-2xl")}>
          <h2 className="font-display text-[32px] font-bold leading-tight tracking-tight text-neutral-900 dark:text-white md:text-[40px] lg:text-[48px]">
            {title}
          </h2>
          {description && (
            <p className="mt-3 text-[17px] leading-relaxed text-neutral-500">
              {description}
            </p>
          )}
        </div>
        {href && align === "left" && (
          <Link
            href={href}
            className="hidden shrink-0 items-center gap-1.5 text-[15px] font-medium text-neutral-900 transition-colors hover:text-primary dark:text-white dark:hover:text-primary md:inline-flex"
          >
            {linkLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>
      {href && align === "center" && (
        <Link
          href={href}
          className="mt-6 inline-flex items-center gap-1.5 text-[15px] font-medium text-primary transition-opacity hover:opacity-80"
        >
          {linkLabel}
          <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}

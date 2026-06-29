"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE_CONTENT_TABS } from "@/lib/admin/site-content-tabs";
import { cn } from "@/lib/utils";

export default function SiteContentNav() {
  const pathname = usePathname();

  return (
    <nav className="mb-8 flex flex-nowrap gap-2 overflow-x-auto border-b border-neutral-200 pb-4 dark:border-neutral-800">
      {SITE_CONTENT_TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-white"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}

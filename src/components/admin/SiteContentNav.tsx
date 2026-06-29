"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/admin/site-content/banner", label: "Hero Banner" },
  { href: "/admin/site-content/footer", label: "Footer" },
  { href: "/admin/site-content/about", label: "About Us" },
] as const;

export default function SiteContentNav() {
  const pathname = usePathname();

  return (
    <nav className="mb-8 flex flex-wrap gap-2 border-b border-neutral-200 pb-4 dark:border-neutral-800">
      {tabs.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors",
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

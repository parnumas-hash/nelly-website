"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Tags,
  FolderTree,
  ImageIcon,
  Monitor,
  Settings,
  ExternalLink,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import Logo from "@/components/ui/Logo";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/brands", label: "Brands", icon: Tags },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/media", label: "Media", icon: ImageIcon },
  { href: "/admin/banners", label: "Banners", icon: Monitor },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const Nav = () => (
    <>
      <div className="mb-8 px-2">
        <Logo href="/admin" size="md" />
        <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-neutral-400">
          Admin
        </p>
      </div>
      <nav className="flex flex-1 flex-col gap-1">
        {links.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-white"
                  : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-900"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
      <Link
        href="/"
        className="mt-auto flex items-center gap-2 rounded-xl border border-neutral-200 px-3 py-2.5 text-sm text-neutral-600 transition-colors hover:border-primary hover:text-primary dark:border-neutral-800"
      >
        <ExternalLink className="h-4 w-4" />
        View Store
      </Link>
    </>
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 bg-white lg:hidden dark:border-neutral-800 dark:bg-neutral-950"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <aside className="hidden w-64 shrink-0 flex-col border-r border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950 lg:flex lg:min-h-screen">
        <Nav />
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute left-0 top-0 flex h-full w-72 flex-col bg-white p-5 dark:bg-neutral-950">
            <button
              onClick={() => setOpen(false)}
              className="mb-4 self-end"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
            <Nav />
          </aside>
        </div>
      )}
    </>
  );
}

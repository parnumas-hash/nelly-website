"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ExternalLink,
  Menu,
  X,
  LogOut,
  Users,
  LayoutDashboard,
  Package,
  Tags,
  FolderTree,
  ImageIcon,
  Monitor,
  Settings,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import Logo from "@/components/ui/Logo";
import {
  formatRoleLabels,
  useAdminSession,
} from "@/context/AdminSessionContext";

const ICONS = {
  "/admin": LayoutDashboard,
  "/admin/products": Package,
  "/admin/brands": Tags,
  "/admin/categories": FolderTree,
  "/admin/media": ImageIcon,
  "/admin/site-content": Monitor,
  "/admin/settings": Settings,
  "/admin/users": Users,
} as const;

export default function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { user, loading, navItems } = useAdminSession();

  const Nav = () => (
    <>
      <div className="mb-8 px-2">
        <Logo href="/admin" size="md" />
        <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-neutral-400">
          Admin
        </p>
      </div>
      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map(({ href, label }) => {
          const Icon = ICONS[href as keyof typeof ICONS] ?? LayoutDashboard;
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

      {user ? (
        <div className="mb-3 rounded-xl border border-neutral-200 px-3 py-3 text-xs dark:border-neutral-800">
          <p className="font-medium text-neutral-900 dark:text-white">
            {user.display_name}
          </p>
          <p className="mt-1 text-neutral-500">@{user.username}</p>
          <p className="mt-1 text-neutral-400">{formatRoleLabels(user.roles)}</p>
        </div>
      ) : loading ? (
        <p className="mb-3 px-2 text-xs text-neutral-400">Loading session...</p>
      ) : null}

      <Link
        href="/"
        className="mt-auto flex items-center gap-2 rounded-xl border border-neutral-200 px-3 py-2.5 text-sm text-neutral-600 transition-colors hover:border-primary hover:text-primary dark:border-neutral-800"
      >
        <ExternalLink className="h-4 w-4" />
        View Store
      </Link>
      <button
        type="button"
        onClick={async () => {
          await fetch("/api/admin/logout", { method: "POST" });
          window.location.href = "/admin/login";
        }}
        className="mt-2 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-neutral-500 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-900"
      >
        <LogOut className="h-4 w-4" />
        Sign Out
      </button>
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

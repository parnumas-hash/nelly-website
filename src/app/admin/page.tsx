"use client";

import Link from "next/link";
import { Package, Tags, ImageIcon, Monitor, Plus } from "lucide-react";
import StatCard from "@/components/admin/StatCard";
import Button from "@/components/ui/Button";
import { useCatalog } from "@/context/CatalogContext";
import { useAdminSession } from "@/context/AdminSessionContext";
import { isRemoteCatalogEnabled } from "@/lib/admin/catalog-sync";

import { getProductTotalStock } from "@/lib/variants";

export default function AdminDashboardPage() {
  const { adminProducts, brands, media, banner, ready } = useCatalog();
  const { hasPermission } = useAdminSession();

  if (!ready) {
    return (
      <div className="flex h-64 items-center justify-center text-neutral-400">
        Loading...
      </div>
    );
  }

  const published = adminProducts.filter((p) => p.status === "published").length;
  const drafts = adminProducts.filter((p) => p.status === "draft").length;
  const lowStock = adminProducts.filter(
    (p) => getProductTotalStock(p.variants ?? []) < 10
  ).length;
  const storageLabel = isRemoteCatalogEnabled()
    ? "Supabase (cloud)"
    : "Browser localStorage";

  const quickLinks = [
    hasPermission("products:write")
      ? { href: "/admin/products/new", label: "Add Product", icon: Plus }
      : null,
    hasPermission("products:read")
      ? { href: "/admin/products", label: "Products", icon: Package }
      : null,
    hasPermission("brands:read")
      ? { href: "/admin/brands", label: "Brands", icon: Tags }
      : null,
    hasPermission("media:read")
      ? { href: "/admin/media", label: "Media", icon: ImageIcon }
      : null,
    hasPermission("banners:read")
      ? { href: "/admin/site-content", label: "Site Content", icon: Monitor }
      : null,
  ].filter(Boolean) as Array<{
    href: string;
    label: string;
    icon: typeof Plus;
  }>;

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Dashboard
          </h1>
          <p className="mt-1 text-neutral-500">
            Overview of your NELLY GROUP store
          </p>
        </div>
        {hasPermission("products:write") ? (
          <Link href="/admin/products/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          </Link>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Products" value={adminProducts.length} />
        <StatCard label="Published" value={published} hint={`${drafts} drafts`} />
        <StatCard label="Brands" value={brands.filter((b) => b.active).length} />
        <StatCard label="Low Stock" value={lowStock} hint="Under 10 units" />
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="font-semibold">Quick Actions</h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {quickLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 rounded-xl border border-neutral-100 px-4 py-3 text-sm transition-colors hover:border-primary hover:text-primary dark:border-neutral-800"
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="font-semibold">Store Status</h2>
          <ul className="mt-4 space-y-3 text-sm text-neutral-600 dark:text-neutral-400">
            <li className="flex justify-between">
              <span>Media library</span>
              <span className="font-medium text-neutral-900 dark:text-white">
                {media.length} files
              </span>
            </li>
            <li className="flex justify-between">
              <span>Hero banner</span>
              <span className="font-medium text-primary">
                {banner.active ? "Active" : "Inactive"}
              </span>
            </li>
            <li className="flex justify-between">
              <span>Data storage</span>
              <span className="font-medium text-neutral-900 dark:text-white">
                {storageLabel}
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

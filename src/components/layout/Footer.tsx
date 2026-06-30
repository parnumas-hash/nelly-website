"use client";

import Link from "next/link";
import Image from "next/image";
import { Instagram, Facebook, Mail } from "lucide-react";
import { useCatalog } from "@/context/CatalogContext";
import { BRAND_LOGO_HEIGHT, BRAND_LOGO_WIDTH } from "@/lib/brand-assets";
import { shouldUnoptimize } from "@/lib/image-utils";

const footerLinks = {
  shop: [
    { label: "All Products", href: "/shop" },
    { label: "New Arrivals", href: "/shop?sort=newest" },
    { label: "How to Shop", href: "/how-to-shop" },
    { label: "First Adventure", href: "/#first-adventure" },
  ],
  company: [
    { label: "About NELLY GROUP", href: "/#about" },
    { label: "Store Locator", href: "/#stores" },
    { label: "Contact Us", href: "/contact" },
  ],
  support: [
    { label: "Shipping & Delivery", href: "/shipping" },
    { label: "Returns & Exchanges", href: "/returns" },
    { label: "FAQ", href: "/faq" },
    { label: "How to Shop", href: "/how-to-shop" },
  ],
};

export default function Footer() {
  const { brands, footer } = useCatalog();
  const brandLinks = brands
    .filter((brand) => brand.active)
    .map((brand) => ({
      label: brand.displayName,
      href: `/shop?brand=${brand.slug}`,
    }));

  const logoSrc = footer.logoUrl;

  return (
    <footer className="border-t border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-20">
        <div className="grid gap-12 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <div className="mx-auto flex max-w-[300px] flex-col items-center text-center lg:mx-0 lg:items-start lg:text-left">
              <Link
                href="/"
                className="flex h-40 w-full items-center justify-center md:h-44"
                aria-label="NELLY GROUP home"
              >
                {logoSrc ? (
                  <Image
                    src={logoSrc}
                    alt={footer.legalName}
                    width={BRAND_LOGO_WIDTH}
                    height={BRAND_LOGO_HEIGHT}
                    className="max-h-full max-w-full object-contain"
                    unoptimized={shouldUnoptimize(logoSrc)}
                  />
                ) : null}
              </Link>
              <p className="mt-2 w-full text-[10px] uppercase tracking-[0.15em] text-neutral-400">
                {footer.legalName}
              </p>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-neutral-500">
                {footer.description}
              </p>
              <div className="mt-6 flex gap-4">
                {[
                  { icon: Instagram, label: "Instagram", href: "#" },
                  { icon: Facebook, label: "Facebook", href: "#" },
                  { icon: Mail, label: "Email", href: "#" },
                ].map(({ icon: Icon, label, href }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 text-neutral-500 transition-all hover:border-primary hover:text-primary dark:border-neutral-800"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-neutral-900 dark:text-white">
              Shop
            </h3>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-neutral-500 transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-neutral-900 dark:text-white">
              Brands
            </h3>
            <ul className="space-y-3">
              {brandLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-neutral-500 transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-neutral-900 dark:text-white">
              Company
            </h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-neutral-500 transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-neutral-900 dark:text-white">
              Support
            </h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-neutral-500 transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-neutral-200 pt-8 dark:border-neutral-800 md:flex-row">
          <p className="text-xs text-neutral-400">
            &copy; {new Date().getFullYear()} NELLY GROUP. All rights reserved.
            Premium Pet Lifestyle Store.
          </p>
          <div className="flex gap-6">
            <Link
              href="/privacy"
              className="text-xs text-neutral-400 transition-colors hover:text-primary"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-xs text-neutral-400 transition-colors hover:text-primary"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

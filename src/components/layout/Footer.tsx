import Link from "next/link";
import { Instagram, Facebook, Mail } from "lucide-react";
import Logo from "@/components/ui/Logo";
import { brands } from "@/lib/brands";

const footerLinks = {
  shop: [
    { label: "All Products", href: "/shop" },
    { label: "New Arrivals", href: "/shop?sort=newest" },
    { label: "Best Sellers", href: "/shop" },
    { label: "Travel with Pets", href: "/shop?category=strollers" },
    { label: "Home Living", href: "/shop?category=beds" },
    { label: "Eco Friendly", href: "/shop?category=eco" },
  ],
  brands: brands.map((b) => ({
    label: b.displayName,
    href: `/shop?brand=${b.slug}`,
  })),
  company: [
    { label: "About NELLY GROUP", href: "/#about" },
    { label: "Store Locator", href: "/#stores" },
    { label: "Careers", href: "#" },
    { label: "Press", href: "#" },
  ],
  support: [
    { label: "Contact Us", href: "#" },
    { label: "Shipping & Delivery", href: "#" },
    { label: "Returns & Exchanges", href: "#" },
    { label: "FAQ", href: "#" },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-20">
        <div className="grid gap-12 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <Logo size="xl" />
            <p className="mt-1 text-[10px] uppercase tracking-[0.15em] text-neutral-400">
              NELLY GROUP CO., LTD.
            </p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-neutral-500">
              Premium pet lifestyle, curated with care. NELLY GROUP brings
              together the world&apos;s finest brands for companions who deserve
              the extraordinary.
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
              {footerLinks.brands.map((link) => (
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
              href="#"
              className="text-xs text-neutral-400 transition-colors hover:text-primary"
            >
              Privacy Policy
            </Link>
            <Link
              href="#"
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

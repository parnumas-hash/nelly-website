"use client";

import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Mail } from "lucide-react";
import { useCatalog } from "@/context/CatalogContext";
import { BRAND_LOGO_HEIGHT, BRAND_LOGO_WIDTH } from "@/lib/brand-assets";
import { FooterLink, FooterSocialLink, FooterSocialPlatform } from "@/types";
import { shouldUnoptimize } from "@/lib/image-utils";

function isExternalHref(href: string) {
  return (
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:")
  );
}

function FooterNavLink({ link }: { link: FooterLink }) {
  const className =
    "text-sm text-neutral-500 transition-colors hover:text-primary";

  if (isExternalHref(link.href)) {
    return (
      <a
        href={link.href}
        className={className}
        target={link.href.startsWith("mailto:") ? undefined : "_blank"}
        rel={link.href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
      >
        {link.label}
      </a>
    );
  }

  return (
    <Link href={link.href} className={className}>
      {link.label}
    </Link>
  );
}

function SocialIcon({ platform }: { platform: FooterSocialPlatform }) {
  if (platform === "instagram") return <Instagram className="h-4 w-4" />;
  if (platform === "facebook") return <Facebook className="h-4 w-4" />;
  return <Mail className="h-4 w-4" />;
}

function FooterSocialAnchor({ link }: { link: FooterSocialLink }) {
  if (!link.href.trim() || link.href === "#") return null;

  return (
    <a
      href={link.href}
      aria-label={link.label}
      target={link.href.startsWith("mailto:") ? undefined : "_blank"}
      rel={link.href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 text-neutral-500 transition-all hover:border-primary hover:text-primary dark:border-neutral-800"
    >
      <SocialIcon platform={link.platform} />
    </a>
  );
}

function FooterLinkColumn({
  title,
  links,
}: {
  title: string;
  links: FooterLink[];
}) {
  return (
    <div>
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-neutral-900 dark:text-white">
        {title}
      </h3>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={`${title}-${link.label}`}>
            <FooterNavLink link={link} />
          </li>
        ))}
      </ul>
    </div>
  );
}

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
                {footer.socialLinks.map((link) => (
                  <FooterSocialAnchor key={link.platform} link={link} />
                ))}
              </div>
            </div>
          </div>

          <FooterLinkColumn
            title={footer.columns.shop.title}
            links={footer.columns.shop.links}
          />

          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-neutral-900 dark:text-white">
              Brands
            </h3>
            <ul className="space-y-3">
              {brandLinks.map((link) => (
                <li key={link.href}>
                  <FooterNavLink link={link} />
                </li>
              ))}
            </ul>
          </div>

          <FooterLinkColumn
            title={footer.columns.company.title}
            links={footer.columns.company.links}
          />

          <FooterLinkColumn
            title={footer.columns.support.title}
            links={footer.columns.support.links}
          />
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-neutral-200 pt-8 dark:border-neutral-800 md:flex-row">
          <p className="text-xs text-neutral-400">
            &copy; {new Date().getFullYear()} {footer.copyrightText}
          </p>
          <div className="flex gap-6">
            {footer.legalLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-xs text-neutral-400 transition-colors hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

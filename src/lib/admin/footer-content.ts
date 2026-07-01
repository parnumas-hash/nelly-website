import { BRAND_LOGO_SRC } from "@/lib/brand-assets";
import { sanitizeImageUrl } from "@/lib/image-utils";
import {
  FooterBranding,
  FooterLink,
  FooterLinkColumn,
  FooterSocialLink,
} from "@/types";

function defaultShopColumn(): FooterLinkColumn {
  return {
    title: "Shop",
    links: [
      { label: "All Products", href: "/shop" },
      { label: "New Arrivals", href: "/shop?sort=newest" },
      { label: "How to Shop", href: "/how-to-shop" },
      { label: "First Adventure", href: "/#first-adventure" },
    ],
  };
}

function defaultCompanyColumn(): FooterLinkColumn {
  return {
    title: "Company",
    links: [
      { label: "About NELLY GROUP", href: "/#about" },
      { label: "Store Locator", href: "/#stores" },
      { label: "Contact Us", href: "/contact" },
    ],
  };
}

function defaultSupportColumn(): FooterLinkColumn {
  return {
    title: "Support",
    links: [
      { label: "Shipping & Delivery", href: "/shipping" },
      { label: "Returns & Exchanges", href: "/returns" },
      { label: "FAQ", href: "/faq" },
      { label: "How to Shop", href: "/how-to-shop" },
    ],
  };
}

function normalizeLink(link: Partial<FooterLink> | undefined, fallback: FooterLink): FooterLink {
  const block = link ?? fallback;
  return {
    label: block.label?.trim() || fallback.label,
    href: block.href?.trim() || fallback.href,
  };
}

function normalizeColumn(
  column: Partial<FooterLinkColumn> | undefined,
  fallback: FooterLinkColumn
): FooterLinkColumn {
  const block = column ?? fallback;
  const links = Array.isArray(block.links) && block.links.length > 0 ? block.links : fallback.links;
  return {
    title: block.title?.trim() || fallback.title,
    links: links.map((link, index) =>
      normalizeLink(link, fallback.links[index] ?? { label: "Link", href: "/" })
    ),
  };
}

function normalizeSocialLink(
  link: Partial<FooterSocialLink> | undefined,
  fallback: FooterSocialLink
): FooterSocialLink {
  const block = link ?? fallback;
  const platform = block.platform ?? fallback.platform;
  return {
    platform:
      platform === "instagram" || platform === "facebook" || platform === "email"
        ? platform
        : fallback.platform,
    label: block.label?.trim() || fallback.label,
    href: block.href?.trim() || fallback.href,
  };
}

export function getDefaultFooterBranding(): FooterBranding {
  return {
    logoUrl: BRAND_LOGO_SRC,
    legalName: "NELLY GROUP CO., LTD.",
    description:
      "Premium pet lifestyle, curated with care. NELLY GROUP brings together the world's finest brands for companions who deserve the extraordinary.",
    columns: {
      shop: defaultShopColumn(),
      company: defaultCompanyColumn(),
      support: defaultSupportColumn(),
    },
    socialLinks: [
      {
        platform: "instagram",
        label: "Instagram",
        href: "https://instagram.com/nellygroup",
      },
      {
        platform: "facebook",
        label: "Facebook",
        href: "https://facebook.com/nellygroup",
      },
      {
        platform: "email",
        label: "Email",
        href: "mailto:hello@nellygroup.com",
      },
    ],
    copyrightText:
      "NELLY GROUP. All rights reserved. Premium Pet Lifestyle Store.",
    legalLinks: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  };
}

export function normalizeFooterBranding(
  stored: Partial<FooterBranding> | null | undefined
): FooterBranding {
  const defaults = getDefaultFooterBranding();
  const data = stored ?? {};

  return {
    logoUrl: sanitizeImageUrl(data.logoUrl, defaults.logoUrl),
    legalName: data.legalName?.trim() || defaults.legalName,
    description: data.description?.trim() || defaults.description,
    columns: {
      shop: normalizeColumn(data.columns?.shop, defaults.columns.shop),
      company: normalizeColumn(data.columns?.company, defaults.columns.company),
      support: normalizeColumn(data.columns?.support, defaults.columns.support),
    },
    socialLinks:
      Array.isArray(data.socialLinks) && data.socialLinks.length > 0
        ? data.socialLinks.map((link, index) =>
            normalizeSocialLink(link, defaults.socialLinks[index] ?? defaults.socialLinks[0])
          )
        : defaults.socialLinks,
    copyrightText: data.copyrightText?.trim() || defaults.copyrightText,
    legalLinks:
      Array.isArray(data.legalLinks) && data.legalLinks.length > 0
        ? data.legalLinks.map((link, index) =>
            normalizeLink(link, defaults.legalLinks[index] ?? { label: "Link", href: "/" })
          )
        : defaults.legalLinks,
  };
}

export function mergeFooterBranding(
  current: FooterBranding,
  patch: Partial<FooterBranding>
): FooterBranding {
  return normalizeFooterBranding({
    ...current,
    ...patch,
    columns: patch.columns
      ? {
          shop: patch.columns.shop
            ? { ...current.columns.shop, ...patch.columns.shop }
            : current.columns.shop,
          company: patch.columns.company
            ? { ...current.columns.company, ...patch.columns.company }
            : current.columns.company,
          support: patch.columns.support
            ? { ...current.columns.support, ...patch.columns.support }
            : current.columns.support,
        }
      : current.columns,
  });
}

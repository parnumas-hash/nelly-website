import type { Metadata } from "next";
import {
  getDefaultSitePagesContent,
  normalizeSitePagesContent,
} from "@/lib/admin/site-pages-content";
import { getSiteUrl } from "@/lib/site-config";
import { loadCatalogFromDb } from "@/lib/supabase/catalog-store";
import { isSupabaseConfigured } from "@/lib/supabase/admin";
import { SitePageKey } from "@/types";

const TRUST_PAGE_PATHS: Record<SitePageKey, string> = {
  shipping: "/shipping",
  returns: "/returns",
  faq: "/faq",
  howToShop: "/how-to-shop",
  privacy: "/privacy",
  terms: "/terms",
};

async function loadSitePagesForMetadata() {
  const defaults = getDefaultSitePagesContent();
  if (!isSupabaseConfigured()) return defaults;

  try {
    const snapshot = await loadCatalogFromDb();
    if (snapshot?.sitePages) {
      return normalizeSitePagesContent(snapshot.sitePages);
    }
  } catch {
    // Fall back to bundled defaults when cloud read fails.
  }

  return defaults;
}

export async function generateTrustPageMetadata(
  key: SitePageKey
): Promise<Metadata> {
  const sitePages = await loadSitePagesForMetadata();
  const page = sitePages[key];
  const path = TRUST_PAGE_PATHS[key];
  const baseUrl = getSiteUrl();

  return {
    title: page.title,
    description: page.description,
    openGraph: {
      title: page.title,
      description: page.description,
      url: `${baseUrl}${path}`,
    },
  };
}

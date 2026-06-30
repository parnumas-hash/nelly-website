import { NextResponse } from "next/server";
import {
  getDefaultCatalogSnapshot,
  loadCatalogFromDb,
  saveCatalogToDb,
  type CatalogSnapshot,
} from "@/lib/supabase/catalog-store";
import { isSupabaseConfigured } from "@/lib/supabase/admin";
import { enrichProductWithMedia } from "@/lib/media-library";
import { getSeedImagesForProduct } from "@/lib/image-utils";
import { sortBrandsAlphabetically } from "@/lib/brand-categories";
import { CATALOG_VERSION } from "@/lib/admin/storage";
import { normalizeCatalogSnapshot } from "@/lib/admin/catalog-normalize";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ empty: true, configured: false });
  }

  try {
    const snapshot = await loadCatalogFromDb();
    const normalized = normalizeCatalogSnapshot(snapshot);

    const products = normalized.products.map((product) =>
      enrichProductWithMedia(
        product,
        normalized.media,
        getSeedImagesForProduct(product)
      )
    );

    return NextResponse.json({
      catalogVersion: normalized.catalogVersion,
      products,
      brands: sortBrandsAlphabetically(normalized.brands),
      categories: normalized.categories,
      media: normalized.media,
      banner: normalized.banner,
      footer: normalized.footer,
      about: normalized.about,
      homeCollections: normalized.homeCollections,
      homepageContent: normalized.homepageContent,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load catalog.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const { requirePermission } = await import("@/lib/admin/auth");

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured." },
      { status: 503 }
    );
  }

  const session = await requirePermission("catalog:write");
  if (session instanceof NextResponse) return session;

  try {
    const body = (await request.json()) as Partial<CatalogSnapshot>;
    const defaults = getDefaultCatalogSnapshot();

    const snapshot: CatalogSnapshot = {
      catalogVersion: body.catalogVersion ?? CATALOG_VERSION,
      products: body.products ?? defaults.products,
      brands: body.brands ?? defaults.brands,
      categories: body.categories ?? defaults.categories,
      media: body.media ?? defaults.media,
      banner: body.banner ?? defaults.banner,
      footer: body.footer ?? defaults.footer,
      about: body.about ?? defaults.about,
      homeCollections: body.homeCollections ?? defaults.homeCollections,
      homepageContent: body.homepageContent ?? defaults.homepageContent,
    };

    const saved = await saveCatalogToDb(snapshot);

    const products = saved.products.map((product) =>
      enrichProductWithMedia(
        product,
        saved.media,
        getSeedImagesForProduct(product)
      )
    );

    return NextResponse.json({
      catalogVersion: saved.catalogVersion,
      products,
      brands: sortBrandsAlphabetically(saved.brands),
      categories: saved.categories,
      media: saved.media,
      banner: saved.banner,
      footer: saved.footer,
      about: saved.about,
      homeCollections: saved.homeCollections,
      homepageContent: saved.homepageContent,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to save catalog.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

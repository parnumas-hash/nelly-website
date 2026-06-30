import { NextResponse } from "next/server";
import { parseCatalogBackup } from "@/lib/admin/backup";
import { getDefaultFooter, getDefaultAbout, getDefaultHomeCollections } from "@/lib/admin/storage";
import { getDefaultHomepageContent } from "@/lib/admin/homepage-content";
import { saveCatalogToDb } from "@/lib/supabase/catalog-store";
import { isSupabaseConfigured } from "@/lib/supabase/admin";
import { enrichProductWithMedia } from "@/lib/media-library";
import { getSeedImagesForProduct } from "@/lib/image-utils";
import { sortBrandsAlphabetically } from "@/lib/brand-categories";
import { requirePermission } from "@/lib/admin/auth";

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured." },
      { status: 503 }
    );
  }

  const session = await requirePermission("settings:write");
  if (session instanceof NextResponse) return session;

  try {
    const raw = await request.text();
    const backup = parseCatalogBackup(raw);

    const saved = await saveCatalogToDb({
      catalogVersion: backup.catalogVersion,
      products: backup.products,
      brands: backup.brands,
      categories: backup.categories,
      media: backup.media,
      banner: backup.banner,
      footer: backup.footer ?? getDefaultFooter(),
      about: backup.about ?? getDefaultAbout(),
      homeCollections: backup.homeCollections ?? getDefaultHomeCollections(),
      homepageContent: backup.homepageContent ?? getDefaultHomepageContent(),
    });

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
      error instanceof Error ? error.message : "Failed to restore backup.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

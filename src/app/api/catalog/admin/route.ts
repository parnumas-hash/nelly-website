import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/auth";
import { normalizeCatalogSnapshot } from "@/lib/admin/catalog-normalize";
import { enrichProductWithMedia } from "@/lib/media-library";
import { getSeedImagesForProduct } from "@/lib/image-utils";
import { sortBrandsAlphabetically } from "@/lib/brand-categories";
import {
  loadCatalogFromDb,
  type CatalogSnapshot,
} from "@/lib/supabase/catalog-store";
import { isSupabaseConfigured } from "@/lib/supabase/admin";

export async function GET() {
  const session = await requireAdminSession();
  if (session instanceof NextResponse) return session;

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured." },
      { status: 503 }
    );
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
      catalogVersion: normalized.catalogVersion ?? 0,
      products,
      brands: sortBrandsAlphabetically(normalized.brands),
      categories: normalized.categories,
      media: normalized.media,
      banner: normalized.banner,
    } satisfies CatalogSnapshot);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load catalog.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import {
  AdminBrand,
  AdminProduct,
  BrandCategory,
  AboutSection,
  FooterBranding,
  HeroBanner,
  HomeCollectionKey,
  HomeCollections,
  MediaItem,
} from "@/types";
import {
  CATALOG_VERSION,
  getDefaultBanner,
  getDefaultBrands,
  getDefaultFooter,
  getDefaultAbout,
  getDefaultHomeCollections,
  getDefaultProducts,
} from "@/lib/admin/storage";
import { stripProductsForStorage } from "@/lib/media-library";
import { normalizeBrandCategories, sortBrandsAlphabetically } from "@/lib/brand-categories";
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";
import { ensurePublicUrl } from "@/lib/supabase/media-storage";

export interface CatalogSnapshot {
  catalogVersion: number;
  products: AdminProduct[];
  brands: AdminBrand[];
  categories: BrandCategory[];
  media: MediaItem[];
  banner: HeroBanner;
  footer: FooterBranding;
  about: AboutSection;
  homeCollections: HomeCollections;
}

interface CatalogRow {
  catalog_version: number;
  products: AdminProduct[];
  brands: AdminBrand[];
  categories: BrandCategory[];
  media: MediaItem[];
  banner: HeroBanner;
  footer?: FooterBranding;
  about?: AboutSection;
  home_collections?: HomeCollections;
}

function defaultSnapshot(): CatalogSnapshot {
  return {
    catalogVersion: CATALOG_VERSION,
    products: getDefaultProducts(),
    brands: getDefaultBrands(),
    categories: [],
    media: [],
    banner: getDefaultBanner(),
    footer: getDefaultFooter(),
    about: getDefaultAbout(),
    homeCollections: getDefaultHomeCollections(),
  };
}

async function uploadMediaLibrary(media: MediaItem[]): Promise<MediaItem[]> {
  const uploaded: MediaItem[] = [];

  for (const item of media) {
    uploaded.push({
      ...item,
      url: await ensurePublicUrl(item.url, `${item.id}.jpg`),
    });
  }

  return uploaded;
}

async function uploadBrandImages(brands: AdminBrand[]): Promise<AdminBrand[]> {
  const next: AdminBrand[] = [];

  for (const brand of brands) {
    if (brand.hasCustomImage && brand.image.startsWith("data:")) {
      const url = await ensurePublicUrl(
        brand.image,
        `brands/${brand.id}.jpg`
      );
      next.push({ ...brand, image: url, hasCustomImage: true });
    } else if (brand.hasCustomImage && brand.image) {
      next.push(brand);
    } else {
      next.push(brand);
    }
  }

  return next;
}

async function uploadCategoryImages(
  categories: BrandCategory[]
): Promise<BrandCategory[]> {
  const next: BrandCategory[] = [];

  for (const category of categories) {
    const imageId = category.imageId;
    if (imageId && imageId.startsWith("data:")) {
      const url = await ensurePublicUrl(
        imageId,
        `categories/${category.id}.jpg`
      );
      next.push({ ...category, imageId: url });
    } else {
      next.push(category);
    }
  }

  return next;
}

export async function loadCatalogFromDb(): Promise<CatalogSnapshot | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("catalog_store")
    .select("*")
    .eq("id", "main")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) return null;

  const row = data as CatalogRow;
  const products = Array.isArray(row.products) ? row.products : [];
  const brands = Array.isArray(row.brands) ? row.brands : [];

  if (products.length === 0 && brands.length === 0) {
    return null;
  }

  return {
    catalogVersion: row.catalog_version ?? CATALOG_VERSION,
    products,
    brands: sortBrandsAlphabetically(brands),
    categories: normalizeBrandCategories(
      Array.isArray(row.categories) ? row.categories : []
    ),
    media: Array.isArray(row.media) ? row.media : [],
    banner: (row.banner as HeroBanner) ?? getDefaultBanner(),
    footer: (row.footer as FooterBranding) ?? getDefaultFooter(),
    about: (row.about as AboutSection) ?? getDefaultAbout(),
    homeCollections:
      (row.home_collections as HomeCollections) ?? getDefaultHomeCollections(),
  };
}

async function uploadHomeCollections(
  homeCollections: HomeCollections
): Promise<HomeCollections> {
  const keys: HomeCollectionKey[] = ["travel", "home", "eco"];
  let next = { ...homeCollections };

  for (const key of keys) {
    const block = next[key];
    if (block.imageUrl?.startsWith("data:")) {
      const url = await ensurePublicUrl(
        block.imageUrl,
        `collections/${key}.jpg`
      );
      next = { ...next, [key]: { ...block, imageUrl: url } };
    }
  }

  return next;
}

async function uploadAboutImage(about: AboutSection): Promise<AboutSection> {
  if (about.imageUrl?.startsWith("data:")) {
    const url = await ensurePublicUrl(about.imageUrl, "about/image.png");
    return { ...about, imageUrl: url };
  }
  return about;
}

async function uploadFooterLogo(footer: FooterBranding): Promise<FooterBranding> {
  if (footer.logoUrl?.startsWith("data:")) {
    const url = await ensurePublicUrl(footer.logoUrl, "footer/logo.png");
    return { ...footer, logoUrl: url };
  }
  return footer;
}

async function uploadBannerPoster(banner: HeroBanner): Promise<HeroBanner> {
  if (banner.posterUrl?.startsWith("data:")) {
    const url = await ensurePublicUrl(banner.posterUrl, "banner/hero.jpg");
    return { ...banner, posterUrl: url };
  }
  return banner;
}

export async function saveCatalogToDb(
  snapshot: CatalogSnapshot
): Promise<CatalogSnapshot> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured.");
  }

  const media = await uploadMediaLibrary(snapshot.media);
  const brands = await uploadBrandImages(snapshot.brands);
  const categories = await uploadCategoryImages(snapshot.categories);
  const banner = await uploadBannerPoster(snapshot.banner);
  const footer = await uploadFooterLogo(snapshot.footer);
  const about = await uploadAboutImage(snapshot.about);
  const homeCollections = await uploadHomeCollections(snapshot.homeCollections);

  const products = stripProductsForStorage(snapshot.products);

  const supabase = createAdminClient();
  const { error } = await supabase.from("catalog_store").upsert({
    id: "main",
    catalog_version: snapshot.catalogVersion ?? CATALOG_VERSION,
    products,
    brands,
    categories,
    media,
    banner,
    footer,
    about,
    home_collections: homeCollections,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    throw new Error(error.message);
  }

  return {
    catalogVersion: snapshot.catalogVersion ?? CATALOG_VERSION,
    products: snapshot.products,
    brands,
    categories,
    media,
    banner,
    footer,
    about,
    homeCollections,
  };
}

export function getDefaultCatalogSnapshot(): CatalogSnapshot {
  return defaultSnapshot();
}

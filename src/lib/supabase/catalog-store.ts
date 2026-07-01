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
  HomepageContent,
  SitePagesContent,
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
import { normalizeHomepageContent, getDefaultHomepageContent } from "@/lib/admin/homepage-content";
import {
  getDefaultSitePagesContent,
  normalizeSitePagesContent,
} from "@/lib/admin/site-pages-content";
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
  homepageContent: HomepageContent;
  sitePages: SitePagesContent;
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
  homepage_content?: HomepageContent;
  site_pages?: SitePagesContent;
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
    homepageContent: getDefaultHomepageContent(),
    sitePages: getDefaultSitePagesContent(),
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
    homepageContent: normalizeHomepageContent(
      row.homepage_content as HomepageContent | undefined
    ),
    sitePages: normalizeSitePagesContent(
      row.site_pages as SitePagesContent | undefined
    ),
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
        `collections/${key}-${Date.now()}.jpg`
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

async function uploadHomepageContent(
  homepageContent: HomepageContent
): Promise<HomepageContent> {
  let next = { ...homepageContent };

  if (next.brandStory.imageUrl?.startsWith("data:")) {
    const url = await ensurePublicUrl(
      next.brandStory.imageUrl,
      `homepage/brand-story-${Date.now()}.jpg`
    );
    next = {
      ...next,
      brandStory: { ...next.brandStory, imageUrl: url },
    };
  }

  const testimonialItems = await Promise.all(
    next.testimonials.items.map(async (item, index) => {
      if (!item.avatar?.startsWith("data:")) return item;
      const url = await ensurePublicUrl(
        item.avatar,
        `homepage/testimonial-${item.id || index}.jpg`
      );
      return { ...item, avatar: url };
    })
  );
  next = {
    ...next,
    testimonials: { ...next.testimonials, items: testimonialItems },
  };

  const instagramPosts = await Promise.all(
    next.instagram.posts.map(async (post, index) => {
      if (!post.image?.startsWith("data:")) return post;
      const url = await ensurePublicUrl(
        post.image,
        `homepage/instagram-${post.id || index}.jpg`
      );
      return { ...post, image: url };
    })
  );
  next = {
    ...next,
    instagram: { ...next.instagram, posts: instagramPosts },
  };

  if (next.firstAdventure.imageUrl?.startsWith("data:")) {
    const url = await ensurePublicUrl(
      next.firstAdventure.imageUrl,
      `homepage/first-adventure-${Date.now()}.jpg`
    );
    next = {
      ...next,
      firstAdventure: { ...next.firstAdventure, imageUrl: url },
    };
  }

  return next;
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
  const homepageContent = await uploadHomepageContent(snapshot.homepageContent);

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
    homepage_content: homepageContent,
    site_pages: snapshot.sitePages,
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
    homepageContent,
    sitePages: snapshot.sitePages,
  };
}

export function getDefaultCatalogSnapshot(): CatalogSnapshot {
  return defaultSnapshot();
}

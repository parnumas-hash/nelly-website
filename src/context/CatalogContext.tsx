"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  AdminBrand,
  AdminProduct,
  BrandCategory,
  BrandFormData,
  HeroBanner,
  FooterBranding,
  AboutSection,
  HomeCollections,
  HomepageContent,
  SitePagesContent,
  MediaItem,
  Product,
  ProductFilters,
  ProductFormData,
  ProductVariant,
  VariantFormData,
} from "@/types";
import {
  adminToStorefront,
  generateId,
  generateSlug,
  getDefaultProducts,
  getDefaultBrands,
  getDefaultBanner,
  getDefaultFooter,
  getDefaultAbout,
  getDefaultHomeCollections,
  initializeCatalogFromStorage,
  loadBanner,
  loadFooter,
  loadAbout,
  loadHomeCollections,
  loadHomepageContent,
  loadSitePages,
  resetAdminStorageToDefaults,
  StorageQuotaError,
  STORAGE_QUOTA_MESSAGE,
} from "@/lib/admin/storage";
import {
  isCloudCatalogMode,
  persistBanner as writeBannerLocal,
  persistFooter as writeFooterLocal,
  persistAbout as writeAboutLocal,
  persistHomeCollections as writeHomeCollectionsLocal,
  persistHomepageContent as writeHomepageContentLocal,
  persistSitePages as writeSitePagesLocal,
  persistBrands as writeBrandsLocal,
  persistCategories as writeCategoriesLocal,
  persistMedia as writeMediaLocal,
  persistProducts as writeProductsLocal,
} from "@/lib/admin/catalog-persistence";
import { getProductTotalStock } from "@/lib/variants";
import { brandToSlug } from "@/lib/utils";
import { compressImageFile } from "@/lib/media-compress";
import {
  enrichProductWithMedia,
  isExternalImageUrl,
  removeUnusedMedia,
  recompressMediaLibrary,
  resolveMediaUrl,
} from "@/lib/media-library";
import { getSeedImagesForProduct, PLACEHOLDER_IMAGE } from "@/lib/image-utils";
import {
  getBrandBySlug,
  getCategoryById,
  getCategoryBySlug,
  normalizeBrandCategories,
  sortBrandsAlphabetically,
} from "@/lib/brand-categories";
import {
  filterShopVisibleProducts,
  productMatchesBrandCategory,
  productMatchesCategoryFilter,
  productMatchesPetTypeFilter,
} from "@/lib/shop-filters";
import { variantComboKey } from "@/lib/variant-matrix";
import {
  applyCatalogBackup,
  createCatalogBackup,
  downloadCatalogBackup,
  getCatalogBackupSummary,
  parseCatalogBackup,
  type CatalogBackupSummary,
} from "@/lib/admin/backup";
import {
  fetchRemoteCatalog,
  isRemoteCatalogEnabled,
  restoreRemoteCatalog,
  scheduleRemoteCatalogSync,
  setCatalogSyncHandlers,
  type CatalogSyncSnapshot,
} from "@/lib/admin/catalog-sync";
import { normalizeCatalogSnapshot } from "@/lib/admin/catalog-normalize";
import {
  getDefaultHomepageContent,
  mergeHomepageContent,
} from "@/lib/admin/homepage-content";
import { mergeFooterBranding } from "@/lib/admin/footer-content";
import {
  getDefaultSitePagesContent,
  mergeSitePagesContent,
} from "@/lib/admin/site-pages-content";
import { fetchStagedLocalRestore } from "@/lib/admin/local-restore";
import { getDefaultCatalogSnapshot } from "@/lib/supabase/catalog-store";
import { CATALOG_VERSION } from "@/lib/admin/storage";
import {
  applyProductImportGroups,
  type ProductImportGroup,
  type ProductImportMode,
} from "@/lib/admin/product-import";

interface CatalogContextType {
  ready: boolean;
  adminProducts: AdminProduct[];
  publishedProducts: Product[];
  brands: AdminBrand[];
  categories: BrandCategory[];
  media: MediaItem[];
  banner: HeroBanner;
  footer: FooterBranding;
  about: AboutSection;
  homeCollections: HomeCollections;
  homepageContent: HomepageContent;
  sitePages: SitePagesContent;
  addProduct: (data: ProductFormData) => AdminProduct;
  updateProduct: (id: string, data: ProductFormData) => void;
  deleteProduct: (id: string) => void;
  addVariant: (productId: string, data: VariantFormData) => ProductVariant;
  updateVariant: (
    productId: string,
    variantId: string,
    data: VariantFormData
  ) => void;
  deleteVariant: (productId: string, variantId: string) => void;
  duplicateVariant: (productId: string, variantId: string) => ProductVariant;
  replaceVariants: (
    productId: string,
    items: Array<{ data: VariantFormData; existingId?: string }>
  ) => void;
  updateBrand: (id: string, data: Partial<AdminBrand>) => void;
  addBrand: (data: BrandFormData) => AdminBrand;
  updateCategories: (categories: BrandCategory[]) => void;
  getBrandBySlug: (slug: string) => AdminBrand | undefined;
  addMedia: (file: File) => Promise<MediaItem>;
  addMediaFromDataUrl: (dataUrl: string, name: string) => Promise<MediaItem>;
  deleteMedia: (id: string) => void;
  getMediaUrl: (id: string) => string;
  resetAdminStorage: () => void;
  exportCatalogBackup: () => void;
  restoreCatalogBackup: (file: File) => Promise<CatalogBackupSummary>;
  purgeUnusedMedia: () => number;
  unusedMediaCount: number;
  storageError: string | null;
  clearStorageError: () => void;
  updateBanner: (data: Partial<HeroBanner>) => boolean;
  updateFooter: (data: Partial<FooterBranding>) => boolean;
  updateAbout: (data: Partial<AboutSection>) => boolean;
  updateHomeCollections: (data: HomeCollections) => boolean;
  updateHomepageContent: (data: Partial<HomepageContent>) => boolean;
  updateSitePages: (data: Partial<SitePagesContent>) => boolean;
  getProductBySlug: (slug: string) => Product | undefined;
  getAdminProduct: (id: string) => AdminProduct | undefined;
  filterProducts: (filters: ProductFilters) => Product[];
  getFeaturedProducts: () => Product[];
  getNewArrivals: () => Product[];
  getBestSellers: () => Product[];
  searchProducts: (query: string) => Product[];
  importProducts: (
    groups: import("@/lib/admin/product-import").ProductImportGroup[],
    mode: import("@/lib/admin/product-import").ProductImportMode
  ) => { created: number; updated: number };
}

const CatalogContext = createContext<CatalogContextType | undefined>(undefined);

function formToAdmin(
  data: ProductFormData,
  existing?: AdminProduct
): Omit<AdminProduct, "id" | "slug" | "updatedAt"> & {
  id?: string;
  slug?: string;
} {
  return {
    id: existing?.id,
    slug: data.slug.trim() || existing?.slug,
    name: data.name,
    brand: data.brand,
    brandId: data.brandId,
    petType:
      data.petType === "dog" || data.petType === "cat" ? data.petType : undefined,
    categoryId: data.categoryId,
    subCategoryName: data.subCategoryName || undefined,
    category: data.category,
    description: data.description,
    longDescription: data.longDescription || data.description,
    variants: existing?.variants ?? [],
    status: data.status,
    featured: data.featured,
    isNew: data.isNew,
    bestSeller: data.bestSeller,
    rating: existing?.rating ?? 4.8,
    reviewCount: existing?.reviewCount ?? 0,
    tags: data.tags,
  };
}

function variantFormToVariant(
  data: VariantFormData,
  existing?: ProductVariant
): ProductVariant {
  return {
    id: existing?.id ?? generateId(),
    color: data.color,
    size: data.size,
    scent: data.scent.trim() || undefined,
    sku: data.sku,
    barcode: data.barcode,
    price: data.price,
    salePrice: data.salePrice || undefined,
    stock: data.stock,
    imageIds: data.imageIds,
    images: (existing?.images ?? []).filter(isExternalImageUrl),
    status: data.status,
  };
}

function touchProduct(product: AdminProduct): AdminProduct {
  return { ...product, updatedAt: new Date().toISOString() };
}

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [adminProducts, setAdminProducts] = useState<AdminProduct[]>([]);
  const [brands, setBrands] = useState<AdminBrand[]>([]);
  const [categories, setCategories] = useState<BrandCategory[]>([]);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [banner, setBanner] = useState<HeroBanner | null>(null);
  const [footer, setFooter] = useState<FooterBranding | null>(null);
  const [about, setAbout] = useState<AboutSection | null>(null);
  const [homeCollections, setHomeCollections] = useState<HomeCollections | null>(null);
  const [homepageContent, setHomepageContent] = useState<HomepageContent | null>(null);
  const [sitePages, setSitePages] = useState<SitePagesContent | null>(null);
  const [storageError, setStorageError] = useState<string | null>(null);
  const mediaRef = useRef<MediaItem[]>([]);
  const adminProductsRef = useRef<AdminProduct[]>([]);
  const categoriesRef = useRef<BrandCategory[]>([]);
  const brandsRef = useRef<AdminBrand[]>([]);
  const bannerRef = useRef<HeroBanner | null>(null);
  const footerRef = useRef<FooterBranding | null>(null);
  const aboutRef = useRef<AboutSection | null>(null);
  const homeCollectionsRef = useRef<HomeCollections | null>(null);
  const homepageContentRef = useRef<HomepageContent | null>(null);
  const sitePagesRef = useRef<SitePagesContent | null>(null);

  useEffect(() => {
    mediaRef.current = media;
  }, [media]);

  useEffect(() => {
    adminProductsRef.current = adminProducts;
  }, [adminProducts]);

  useEffect(() => {
    categoriesRef.current = categories;
  }, [categories]);

  useEffect(() => {
    brandsRef.current = brands;
  }, [brands]);

  useEffect(() => {
    bannerRef.current = banner;
  }, [banner]);

  useEffect(() => {
    footerRef.current = footer;
  }, [footer]);

  useEffect(() => {
    aboutRef.current = about;
  }, [about]);

  useEffect(() => {
    homeCollectionsRef.current = homeCollections;
  }, [homeCollections]);

  useEffect(() => {
    homepageContentRef.current = homepageContent;
  }, [homepageContent]);

  useEffect(() => {
    sitePagesRef.current = sitePages;
  }, [sitePages]);

  const resolveBannerFallback = useCallback(
    () => (isRemoteCatalogEnabled() ? getDefaultBanner() : loadBanner()),
    []
  );

  const resolveFooterFallback = useCallback(
    () => (isRemoteCatalogEnabled() ? getDefaultFooter() : loadFooter()),
    []
  );

  const resolveAboutFallback = useCallback(
    () => (isRemoteCatalogEnabled() ? getDefaultAbout() : loadAbout()),
    []
  );

  const resolveHomeCollectionsFallback = useCallback(
    () =>
      isRemoteCatalogEnabled()
        ? getDefaultHomeCollections()
        : loadHomeCollections(),
    []
  );

  const resolveHomepageContentFallback = useCallback(
    () =>
      isRemoteCatalogEnabled()
        ? getDefaultHomepageContent()
        : loadHomepageContent(),
    []
  );

  const resolveSitePagesFallback = useCallback(
    () =>
      isRemoteCatalogEnabled()
        ? getDefaultSitePagesContent()
        : loadSitePages(),
    []
  );

  const syncRemoteCatalog = useCallback(
    (overrides?: Partial<CatalogSyncSnapshot>) => {
      scheduleRemoteCatalogSync(
        normalizeCatalogSnapshot({
          catalogVersion: CATALOG_VERSION,
          products: adminProductsRef.current,
          brands: brandsRef.current,
          categories: categoriesRef.current,
          media: mediaRef.current,
          banner: bannerRef.current ?? resolveBannerFallback(),
          footer: footerRef.current ?? resolveFooterFallback(),
          about: aboutRef.current ?? resolveAboutFallback(),
          homeCollections:
            homeCollectionsRef.current ?? resolveHomeCollectionsFallback(),
          homepageContent:
            homepageContentRef.current ?? resolveHomepageContentFallback(),
          sitePages: sitePagesRef.current ?? resolveSitePagesFallback(),
          ...overrides,
        })
      );
    },
    [
    resolveBannerFallback,
    resolveFooterFallback,
    resolveAboutFallback,
    resolveHomeCollectionsFallback,
    resolveHomepageContentFallback,
    resolveSitePagesFallback,
  ]);

  const enrichProducts = useCallback(
    (products: AdminProduct[], mediaItems: MediaItem[]) =>
      products.map((product) =>
        enrichProductWithMedia(
          product,
          mediaItems,
          getSeedImagesForProduct(product)
        )
      ),
    []
  );

  const applyCatalogSnapshot = useCallback(
    (snapshot: CatalogSyncSnapshot) => {
      const normalized = normalizeCatalogSnapshot(snapshot);
      const enriched = enrichProducts(normalized.products, normalized.media);
      setAdminProducts(enriched);
      adminProductsRef.current = enriched;
      setBrands(normalized.brands);
      brandsRef.current = normalized.brands;
      setCategories(normalized.categories);
      categoriesRef.current = normalized.categories;
      setMedia(normalized.media);
      mediaRef.current = normalized.media;
      setBanner(normalized.banner);
      bannerRef.current = normalized.banner;
      setFooter(normalized.footer);
      footerRef.current = normalized.footer;
      setAbout(normalized.about);
      aboutRef.current = normalized.about;
      setHomeCollections(normalized.homeCollections);
      homeCollectionsRef.current = normalized.homeCollections;
      setHomepageContent(normalized.homepageContent);
      homepageContentRef.current = normalized.homepageContent;
      setSitePages(normalized.sitePages);
      sitePagesRef.current = normalized.sitePages;
    },
    [enrichProducts]
  );

  useEffect(() => {
    setCatalogSyncHandlers({
      onError: (message) =>
        setStorageError(`Cloud save failed: ${message}`),
      onSuccess: (saved) => {
        applyCatalogSnapshot(saved);
        setStorageError((current) =>
          current?.startsWith("Cloud save failed:") ? null : current
        );
      },
    });
    return () => setCatalogSyncHandlers({});
  }, [applyCatalogSnapshot]);

  useEffect(() => {
    let cancelled = false;

    async function loadCatalog() {
      if (isRemoteCatalogEnabled()) {
        try {
          const remote = await fetchRemoteCatalog();
          if (!cancelled && remote) {
            applyCatalogSnapshot(remote);
            setReady(true);
            return;
          }
        } catch (error) {
          if (!cancelled) {
            setStorageError(
              error instanceof Error
                ? error.message
                : "Could not load catalog from cloud."
            );
          }
        }

        if (!cancelled) {
          applyCatalogSnapshot(normalizeCatalogSnapshot(null));
          setReady(true);
        }
        return;
      }

      if (cancelled) return;

      try {
        const stagedBackup = await fetchStagedLocalRestore();
        if (stagedBackup && !cancelled) {
          const snapshot = applyCatalogBackup(stagedBackup);
          setAdminProducts(snapshot.products);
          setBrands(snapshot.brands);
          setCategories(snapshot.categories);
          setMedia(snapshot.media);
          mediaRef.current = snapshot.media;
          setBanner(snapshot.banner);
          setFooter(snapshot.footer);
          setAbout(snapshot.about);
          setHomeCollections(snapshot.homeCollections);
          setHomepageContent(snapshot.homepageContent);
          setSitePages(snapshot.sitePages);
          setStorageError(null);
          setReady(true);
          return;
        }

        const catalog = initializeCatalogFromStorage();
        setAdminProducts(catalog.products);
        setBrands(catalog.brands);
        setCategories(catalog.categories);
        const cleaned = removeUnusedMedia(
          catalog.media,
          catalog.products,
          catalog.categories
        );
        if (cleaned.removedCount > 0) {
          try {
            writeMediaLocal(cleaned.media);
            setMedia(cleaned.media);
            mediaRef.current = cleaned.media;
          } catch {
            setMedia(catalog.media);
            mediaRef.current = catalog.media;
          }
        } else {
          setMedia(catalog.media);
          mediaRef.current = catalog.media;
        }
        setBanner(catalog.banner);
        setFooter(catalog.footer);
        setAbout(catalog.about);
        setHomeCollections(catalog.homeCollections);
        setHomepageContent(catalog.homepageContent);
        setSitePages(catalog.sitePages);
      } catch (error) {
        if (error instanceof StorageQuotaError) {
          setStorageError(error.message);
        }
        const defaults = getDefaultProducts();
        setAdminProducts(
          defaults.map((product) =>
            enrichProductWithMedia(product, [], getSeedImagesForProduct(product))
          )
        );
        setBrands(getDefaultBrands());
        setCategories([]);
        setMedia([]);
        setBanner(loadBanner());
        setFooter(loadFooter());
        setAbout(loadAbout());
        setHomeCollections(loadHomeCollections());
        setHomepageContent(loadHomepageContent());
        setSitePages(loadSitePages());
      } finally {
        if (!cancelled) setReady(true);
      }
    }

    void loadCatalog();

    return () => {
      cancelled = true;
    };
  }, [applyCatalogSnapshot]);

  const getMediaUrl = useCallback(
    (id: string) => resolveMediaUrl(id, media) ?? PLACEHOLDER_IMAGE,
    [media]
  );

  const clearStorageError = useCallback(() => setStorageError(null), []);

  const commitMedia = useCallback(
    async (nextMedia: MediaItem[], rollback?: MediaItem[]) => {
      const restore = () => {
        const restored = rollback ?? mediaRef.current;
        mediaRef.current = restored;
        setMedia(restored);
      };

      const persist = (items: MediaItem[]) => {
        writeMediaLocal(items);
        mediaRef.current = items;
        setMedia(items);
        setStorageError(null);
      };

      try {
        persist(nextMedia);
        syncRemoteCatalog();
        return;
      } catch (error) {
        if (!(error instanceof StorageQuotaError)) {
          restore();
          throw new Error("Could not save image.");
        }
      }

      const products = adminProductsRef.current;
      const cats = categoriesRef.current;

      const purged = removeUnusedMedia(nextMedia, products, cats);
      try {
        persist(purged.media);
        if (purged.removedCount > 0) {
          setStorageError(
            `Freed space by removing ${purged.removedCount} unused image(s).`
          );
        }
        syncRemoteCatalog();
        return;
      } catch (error) {
        if (!(error instanceof StorageQuotaError)) {
          restore();
          throw new Error("Could not save image.");
        }
      }

      try {
        const recompressed = await recompressMediaLibrary(purged.media);
        persist(recompressed);
        setStorageError("Images were recompressed to free storage space.");
        syncRemoteCatalog();
        return;
      } catch (error) {
        restore();
        if (error instanceof StorageQuotaError) {
          setStorageError(STORAGE_QUOTA_MESSAGE);
          throw error;
        }
        throw new Error("Could not save image.");
      }
    },
    [syncRemoteCatalog]
  );

  const publishedProducts = useMemo(() => {
    const seen = new Set<string>();
    const fromStore = adminProducts
      .filter((p) => p.status === "published")
      .map((p) => adminToStorefront(p, media))
      .filter((p) => {
        if (seen.has(p.id)) return false;
        seen.add(p.id);
        return true;
      });
    if (fromStore.length > 0) return fromStore;
    if (!ready) return [];
    return getDefaultProducts().map((p) => adminToStorefront(p, media));
  }, [adminProducts, media, ready]);

  const persistProducts = useCallback(
    (next: AdminProduct[]) => {
      const enriched = enrichProducts(next, mediaRef.current);
      adminProductsRef.current = enriched;
      setAdminProducts(enriched);
      try {
        writeProductsLocal(enriched);
        setStorageError(null);
        syncRemoteCatalog({ products: enriched });
      } catch (error) {
        if (error instanceof StorageQuotaError) {
          setStorageError(error.message);
        } else {
          setStorageError("Could not save product changes.");
        }
      }
    },
    [enrichProducts, syncRemoteCatalog]
  );

  const addProduct = useCallback(
    (data: ProductFormData) => {
      const slugs = adminProducts.map((p) => p.slug);
      const slug =
        data.slug.trim() !== ""
          ? generateSlug(data.slug.trim(), slugs)
          : generateSlug(data.name, slugs);
      const product: AdminProduct = {
        ...formToAdmin(data),
        id: generateId(),
        slug,
        updatedAt: new Date().toISOString(),
      } as AdminProduct;
      persistProducts([product, ...adminProducts]);
      return product;
    },
    [adminProducts, persistProducts]
  );

  const updateProduct = useCallback(
    (id: string, data: ProductFormData) => {
      const slugs = adminProducts.filter((p) => p.id !== id).map((p) => p.slug);
      const trimmed = data.slug.trim();
      const slug =
        trimmed !== ""
          ? generateSlug(trimmed, slugs)
          : generateSlug(data.name, slugs);
      persistProducts(
        adminProducts.map((p) =>
          p.id === id
            ? touchProduct({
                ...formToAdmin(data, p),
                id: p.id,
                slug,
              } as AdminProduct)
            : p
        )
      );
    },
    [adminProducts, persistProducts]
  );

  const deleteProduct = useCallback(
    (id: string) => {
      persistProducts(adminProducts.filter((p) => p.id !== id));
    },
    [adminProducts, persistProducts]
  );

  const addVariant = useCallback(
    (productId: string, data: VariantFormData) => {
      const variant = variantFormToVariant(data);
      persistProducts(
        adminProducts.map((p) =>
          p.id === productId
            ? touchProduct({
                ...p,
                variants: [...p.variants, variant],
              })
            : p
        )
      );
      return variant;
    },
    [adminProducts, persistProducts]
  );

  const updateVariant = useCallback(
    (productId: string, variantId: string, data: VariantFormData) => {
      persistProducts(
        adminProducts.map((p) =>
          p.id === productId
            ? touchProduct({
                ...p,
                variants: p.variants.map((v) =>
                  v.id === variantId ? variantFormToVariant(data, v) : v
                ),
              })
            : p
        )
      );
    },
    [adminProducts, persistProducts]
  );

  const deleteVariant = useCallback(
    (productId: string, variantId: string) => {
      persistProducts(
        adminProducts.map((p) =>
          p.id === productId
            ? touchProduct({
                ...p,
                variants: p.variants.filter((v) => v.id !== variantId),
              })
            : p
        )
      );
    },
    [adminProducts, persistProducts]
  );

  const duplicateVariant = useCallback(
    (productId: string, variantId: string) => {
      let duplicate: ProductVariant | null = null;
      persistProducts(
        adminProducts.map((p) => {
          if (p.id !== productId) return p;
          const source = p.variants.find((v) => v.id === variantId);
          if (!source) return p;
          duplicate = {
            ...source,
            id: generateId(),
            sku: `${source.sku}-COPY`,
            imageIds: [...(source.imageIds ?? [])],
            images: (source.images ?? []).filter(isExternalImageUrl),
          };
          return touchProduct({
            ...p,
            variants: [...p.variants, duplicate],
          });
        })
      );
      if (!duplicate) throw new Error("Variant not found");
      return duplicate;
    },
    [adminProducts, persistProducts]
  );

  const replaceVariants = useCallback(
    (
      productId: string,
      items: Array<{ data: VariantFormData; existingId?: string }>
    ) => {
      persistProducts(
        adminProducts.map((p) => {
          if (p.id !== productId) return p;
          const existingById = new Map(p.variants.map((v) => [v.id, v]));
          const existingByKey = new Map(
            p.variants.map((v) => [
              variantComboKey(v.color, v.size, v.scent ?? ""),
              v,
            ])
          );

          const variants = items.map(({ data, existingId }) => {
            let existing = existingId
              ? existingById.get(existingId)
              : undefined;
            if (!existing) {
              existing = existingByKey.get(
                variantComboKey(data.color, data.size, data.scent ?? "")
              );
            }
            return variantFormToVariant(data, existing);
          });

          return touchProduct({ ...p, variants });
        })
      );
    },
    [adminProducts, persistProducts]
  );

  const updateBrand = useCallback(
    (id: string, data: Partial<AdminBrand>) => {
      const next = brands.map((b) => (b.id === id ? { ...b, ...data } : b));
      setBrands(next);
      try {
        writeBrandsLocal(next);
        setStorageError(null);
        syncRemoteCatalog();
      } catch (error) {
        if (error instanceof StorageQuotaError) {
          setStorageError(error.message);
        } else {
          setStorageError("Could not save brand changes.");
        }
      }
    },
    [brands, syncRemoteCatalog]
  );

  const addBrand = useCallback(
    (data: BrandFormData) => {
      const displayName = data.displayName.trim();
      const slugs = brands.map((b) => b.slug);
      const slug =
        data.slug.trim() !== ""
          ? generateSlug(data.slug.trim(), slugs)
          : generateSlug(displayName, slugs);

      const brand: AdminBrand = {
        id: generateId(),
        name: displayName,
        displayName,
        slug,
        tagline: data.tagline.trim(),
        description: data.description.trim(),
        image: "",
        hasCustomImage: false,
        active: data.active,
        categories: [],
      };

      const next = [...brands, brand];
      setBrands(next);
      try {
        writeBrandsLocal(next);
        setStorageError(null);
        syncRemoteCatalog();
      } catch (error) {
        if (error instanceof StorageQuotaError) {
          setStorageError(error.message);
        } else {
          setStorageError("Could not save new brand.");
        }
        throw error;
      }
      return brand;
    },
    [brands, syncRemoteCatalog]
  );

  const updateCategories = useCallback(
    (nextCategories: BrandCategory[]) => {
      const previous = categories;
      const normalized = normalizeBrandCategories(nextCategories);
      const removedIds = previous
        .filter(
          (category) => !normalized.some((item) => item.id === category.id)
        )
        .map((category) => category.id);

      setCategories(normalized);
      try {
        writeCategoriesLocal(normalized);
        setStorageError(null);
        syncRemoteCatalog();
      } catch (error) {
        if (error instanceof StorageQuotaError) {
          setStorageError(error.message);
        } else {
          setStorageError("Could not save categories.");
          return;
        }
      }

      if (removedIds.length > 0) {
        persistProducts(
          adminProducts.map((product) =>
            removedIds.includes(product.categoryId)
              ? touchProduct({
                  ...product,
                  categoryId: "",
                  category: "accessories",
                })
              : product
          )
        );
      }
    },
    [categories, adminProducts, persistProducts, syncRemoteCatalog]
  );

  const getBrandBySlugFn = useCallback(
    (slug: string) => getBrandBySlug(brands, slug),
    [brands]
  );

  const addMediaFromDataUrl = useCallback(
    async (dataUrl: string, name: string) => {
      const item: MediaItem = {
        id: generateId(),
        name,
        url: dataUrl,
        type: "image",
        createdAt: new Date().toISOString(),
      };
      const rollback = mediaRef.current;
      const nextMedia = [item, ...rollback];
      await commitMedia(nextMedia, rollback);
      return item;
    },
    [commitMedia]
  );

  const addMedia = useCallback(
    async (file: File) => {
      const dataUrl = await compressImageFile(file);
      const item: MediaItem = {
        id: generateId(),
        name: file.name,
        url: dataUrl,
        type: "image",
        createdAt: new Date().toISOString(),
      };
      const rollback = mediaRef.current;
      const nextMedia = [item, ...rollback];
      await commitMedia(nextMedia, rollback);
      return item;
    },
    [commitMedia]
  );

  const purgeUnusedMedia = useCallback(() => {
    const products = adminProductsRef.current;
    const cats = categoriesRef.current;
    const result = removeUnusedMedia(mediaRef.current, products, cats);

    if (result.removedCount === 0) {
      setStorageError("No unused images to remove.");
      return 0;
    }

    try {
      writeMediaLocal(result.media);
      mediaRef.current = result.media;
      setMedia(result.media);
      setStorageError(null);
      syncRemoteCatalog();
      return result.removedCount;
    } catch (error) {
      if (error instanceof StorageQuotaError) {
        setStorageError(STORAGE_QUOTA_MESSAGE);
      } else {
        setStorageError("Could not remove unused images.");
      }
      return 0;
    }
  }, [syncRemoteCatalog]);

  const unusedMediaCount = useMemo(
    () => removeUnusedMedia(media, adminProducts, categories).removedCount,
    [media, adminProducts, categories]
  );

  const deleteMedia = useCallback(
    (id: string) => {
      const next = media.filter((m) => m.id !== id);
      setMedia(next);
      try {
        writeMediaLocal(next);
        setStorageError(null);
        syncRemoteCatalog();
      } catch (error) {
        if (error instanceof StorageQuotaError) {
          setStorageError(error.message);
        } else {
          setStorageError("Could not delete media.");
        }
      }
    },
    [media, syncRemoteCatalog]
  );

  const resetAdminStorage = useCallback(() => {
    try {
      if (isCloudCatalogMode()) {
        applyCatalogSnapshot(getDefaultCatalogSnapshot());
      } else {
        const snapshot = resetAdminStorageToDefaults();
        setAdminProducts(enrichProducts(snapshot.products, snapshot.media));
        setBrands(snapshot.brands);
        setCategories(snapshot.categories);
        setMedia(snapshot.media);
        mediaRef.current = snapshot.media;
        setBanner(snapshot.banner);
        setFooter(snapshot.footer);
        setAbout(snapshot.about);
        setHomeCollections(snapshot.homeCollections);
        setHomepageContent(snapshot.homepageContent);
        setSitePages(snapshot.sitePages);
      }
      setStorageError(null);
      syncRemoteCatalog();
    } catch (error) {
      if (error instanceof StorageQuotaError) {
        setStorageError(error.message);
      } else {
        setStorageError("Could not reset storage.");
      }
    }
  }, [applyCatalogSnapshot, enrichProducts, syncRemoteCatalog]);

  const exportCatalogBackup = useCallback(() => {
    const backup = createCatalogBackup({
      products: adminProductsRef.current,
      brands,
      categories,
      media: mediaRef.current,
      banner: banner ?? resolveBannerFallback(),
      footer: footer ?? resolveFooterFallback(),
      about: about ?? resolveAboutFallback(),
      homeCollections: homeCollections ?? resolveHomeCollectionsFallback(),
      homepageContent: homepageContent ?? resolveHomepageContentFallback(),
      sitePages: sitePages ?? resolveSitePagesFallback(),
    });
    downloadCatalogBackup(backup);
    setStorageError(null);
  }, [
    brands,
    categories,
    banner,
    footer,
    about,
    homeCollections,
    homepageContent,
    sitePages,
    resolveBannerFallback,
    resolveFooterFallback,
    resolveAboutFallback,
    resolveHomeCollectionsFallback,
    resolveHomepageContentFallback,
    resolveSitePagesFallback,
  ]);

  const restoreCatalogBackup = useCallback(
    async (file: File) => {
      const text = await file.text();
      const backup = parseCatalogBackup(text);

      try {
        if (isRemoteCatalogEnabled()) {
          const snapshot = await restoreRemoteCatalog(text);
          applyCatalogSnapshot(snapshot);
          setStorageError(null);
          return getCatalogBackupSummary(backup);
        }

        const snapshot = applyCatalogBackup(backup);
        setAdminProducts(snapshot.products);
        setBrands(snapshot.brands);
        setCategories(snapshot.categories);
        setMedia(snapshot.media);
        mediaRef.current = snapshot.media;
        setBanner(snapshot.banner);
        setFooter(snapshot.footer);
        setAbout(snapshot.about);
        setHomeCollections(snapshot.homeCollections);
        setHomepageContent(snapshot.homepageContent);
        setSitePages(snapshot.sitePages);
        setStorageError(null);
        return getCatalogBackupSummary(backup);
      } catch (error) {
        if (error instanceof StorageQuotaError) {
          setStorageError(error.message);
          throw new Error(error.message);
        }
        throw new Error(
          error instanceof Error
            ? error.message
            : "Could not restore backup. The file may be too large."
        );
      }
    },
    [applyCatalogSnapshot]
  );

  const updateBanner = useCallback((data: Partial<HeroBanner>): boolean => {
    const next = { ...(bannerRef.current ?? resolveBannerFallback()), ...data };
    bannerRef.current = next;
    setBanner(next);
    try {
      writeBannerLocal(next);
      setStorageError(null);
    } catch (error) {
      if (error instanceof StorageQuotaError && isRemoteCatalogEnabled()) {
        setStorageError(null);
      } else if (error instanceof StorageQuotaError) {
        setStorageError(error.message);
        return false;
      } else {
        setStorageError("Could not save banner.");
        return false;
      }
    }
    syncRemoteCatalog({ banner: next });
    return true;
  }, [syncRemoteCatalog, resolveBannerFallback]);

  const updateFooter = useCallback((data: Partial<FooterBranding>): boolean => {
    const next = mergeFooterBranding(
      footerRef.current ?? resolveFooterFallback(),
      data
    );
    footerRef.current = next;
    setFooter(next);
    try {
      writeFooterLocal(next);
      setStorageError(null);
    } catch (error) {
      if (error instanceof StorageQuotaError && isRemoteCatalogEnabled()) {
        setStorageError(null);
      } else if (error instanceof StorageQuotaError) {
        setStorageError(error.message);
        return false;
      } else {
        setStorageError("Could not save footer.");
        return false;
      }
    }
    syncRemoteCatalog({ footer: next });
    return true;
  }, [syncRemoteCatalog, resolveFooterFallback]);

  const updateAbout = useCallback((data: Partial<AboutSection>): boolean => {
    const next = { ...(aboutRef.current ?? resolveAboutFallback()), ...data };
    aboutRef.current = next;
    setAbout(next);
    try {
      writeAboutLocal(next);
      setStorageError(null);
    } catch (error) {
      if (error instanceof StorageQuotaError && isRemoteCatalogEnabled()) {
        setStorageError(null);
      } else if (error instanceof StorageQuotaError) {
        setStorageError(error.message);
        return false;
      } else {
        setStorageError("Could not save about section.");
        return false;
      }
    }
    syncRemoteCatalog({ about: next });
    return true;
  }, [syncRemoteCatalog, resolveAboutFallback]);

  const updateHomeCollections = useCallback((data: HomeCollections): boolean => {
    homeCollectionsRef.current = data;
    setHomeCollections(data);
    try {
      writeHomeCollectionsLocal(data);
      setStorageError(null);
    } catch (error) {
      if (error instanceof StorageQuotaError && isRemoteCatalogEnabled()) {
        setStorageError(null);
      } else if (error instanceof StorageQuotaError) {
        setStorageError(error.message);
        return false;
      } else {
        setStorageError("Could not save home collections.");
        return false;
      }
    }
    syncRemoteCatalog({ homeCollections: data });
    return true;
  }, [syncRemoteCatalog]);

  const updateHomepageContent = useCallback(
    (data: Partial<HomepageContent>): boolean => {
      const next = mergeHomepageContent(
        homepageContentRef.current ?? resolveHomepageContentFallback(),
        data
      );
      homepageContentRef.current = next;
      setHomepageContent(next);
      try {
        writeHomepageContentLocal(next);
        setStorageError(null);
      } catch (error) {
        if (error instanceof StorageQuotaError && isRemoteCatalogEnabled()) {
          setStorageError(null);
        } else if (error instanceof StorageQuotaError) {
          setStorageError(error.message);
          return false;
        } else {
          setStorageError("Could not save homepage content.");
          return false;
        }
      }
      syncRemoteCatalog({ homepageContent: next });
      return true;
    },
    [syncRemoteCatalog, resolveHomepageContentFallback]
  );

  const updateSitePages = useCallback(
    (data: Partial<SitePagesContent>): boolean => {
      const next = mergeSitePagesContent(
        sitePagesRef.current ?? resolveSitePagesFallback(),
        data
      );
      sitePagesRef.current = next;
      setSitePages(next);
      try {
        writeSitePagesLocal(next);
        setStorageError(null);
      } catch (error) {
        if (error instanceof StorageQuotaError && isRemoteCatalogEnabled()) {
          setStorageError(null);
        } else if (error instanceof StorageQuotaError) {
          setStorageError(error.message);
          return false;
        } else {
          setStorageError("Could not save trust pages.");
          return false;
        }
      }
      syncRemoteCatalog({ sitePages: next });
      return true;
    },
    [syncRemoteCatalog, resolveSitePagesFallback]
  );

  const getProductBySlug = useCallback(
    (slug: string) => publishedProducts.find((p) => p.slug === slug),
    [publishedProducts]
  );

  const getAdminProduct = useCallback(
    (id: string) => adminProducts.find((p) => p.id === id),
    [adminProducts]
  );

  const filterProducts = useCallback(
    (filters: ProductFilters) => {
      let result = filterShopVisibleProducts(publishedProducts);

      if (filters.brand) {
        result = result.filter(
          (p) =>
            brandToSlug(p.brand) === filters.brand!.toLowerCase() ||
            p.brandId ===
              brands.find((brand) => brand.slug === filters.brand)?.id
        );
      }

      if (filters.petType) {
        result = result.filter((p) =>
          productMatchesPetTypeFilter(p, filters.petType!)
        );
      }

      if (filters.categoryId) {
        const category = getCategoryById(categories, filters.categoryId);
        if (category) {
          result = result.filter((p) =>
            productMatchesBrandCategory(p, category, categories)
          );
        } else {
          result = result.filter((p) => p.categoryId === filters.categoryId);
        }
      } else if (filters.category && filters.category !== "all") {
        result = result.filter((p) =>
          productMatchesCategoryFilter(p, filters.category!, categories)
        );
      } else if (filters.category === "all") {
        // keep all
      }

      if (filters.query) {
        const q = filters.query.toLowerCase();
        result = result.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.brand.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            (p.subCategoryName ?? "").toLowerCase().includes(q) ||
            (p.variants ?? []).some(
              (v) =>
                v.sku.toLowerCase().includes(q) ||
                v.color.toLowerCase().includes(q) ||
                (v.scent ?? "").toLowerCase().includes(q)
            )
        );
      }
      switch (filters.sort) {
        case "price-asc":
          result.sort((a, b) => a.price - b.price);
          break;
        case "price-desc":
          result.sort((a, b) => b.price - a.price);
          break;
        case "newest":
          result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
          break;
        default:
          result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
      }
      return result;
    },
    [publishedProducts, brands, categories]
  );

  const getFeaturedProducts = useCallback(
    () => publishedProducts.filter((p) => p.featured),
    [publishedProducts]
  );

  const getNewArrivals = useCallback(() => {
    const arrivals = publishedProducts.filter((p) => p.isNew);
    return arrivals.length > 0 ? arrivals : publishedProducts.slice(0, 4);
  }, [publishedProducts]);

  const getBestSellers = useCallback(() => {
    const best = publishedProducts.filter((p) => p.bestSeller);
    return best.length > 0 ? best : publishedProducts.slice(0, 4);
  }, [publishedProducts]);

  const searchProducts = useCallback(
    (query: string) => filterProducts({ query }),
    [filterProducts]
  );

  const importProducts = useCallback(
    (groups: ProductImportGroup[], mode: ProductImportMode) => {
      const { nextProducts, created, updated } = applyProductImportGroups(
        adminProducts,
        groups,
        mode
      );
      persistProducts(nextProducts);
      return { created, updated };
    },
    [adminProducts, persistProducts]
  );

  const sortedBrands = useMemo(
    () => sortBrandsAlphabetically(brands),
    [brands]
  );

  const value: CatalogContextType = {
    ready,
    adminProducts,
    publishedProducts,
    brands: sortedBrands,
    categories,
    media,
    banner: banner ?? resolveBannerFallback(),
    footer: footer ?? resolveFooterFallback(),
    about: about ?? resolveAboutFallback(),
    homeCollections: homeCollections ?? resolveHomeCollectionsFallback(),
    homepageContent: homepageContent ?? resolveHomepageContentFallback(),
    sitePages: sitePages ?? resolveSitePagesFallback(),
    addProduct,
    updateProduct,
    deleteProduct,
    addVariant,
    updateVariant,
    deleteVariant,
    duplicateVariant,
    replaceVariants,
    updateBrand,
    addBrand,
    updateCategories,
    getBrandBySlug: getBrandBySlugFn,
    addMedia,
    addMediaFromDataUrl,
    deleteMedia,
    getMediaUrl,
    resetAdminStorage,
    exportCatalogBackup,
    restoreCatalogBackup,
    purgeUnusedMedia,
    unusedMediaCount,
    storageError,
    clearStorageError,
    updateBanner,
    updateFooter,
    updateAbout,
    updateHomeCollections,
    updateHomepageContent,
    updateSitePages,
    getProductBySlug,
    getAdminProduct,
    filterProducts,
    getFeaturedProducts,
    getNewArrivals,
    getBestSellers,
    searchProducts,
    importProducts,
  };

  return (
    <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
  );
}

export function useCatalog() {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error("useCatalog must be used within CatalogProvider");
  return ctx;
}

export { getProductTotalStock };

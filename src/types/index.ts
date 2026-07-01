export type ProductStatus = "draft" | "published";
export type VariantStatus = "available" | "out-of-stock";
export type PetType = "dog" | "cat" | "both";
export type ProductPetType = "dog" | "cat";

export interface BrandCategory {
  id: string;
  name: string;
  slug: string;
  petType: PetType;
  /** Inline data URL or legacy media library id */
  imageId?: string;
  sortOrder: number;
  active: boolean;
}

export interface ProductVariant {
  id: string;
  color: string;
  size: string;
  scent?: string;
  sku: string;
  barcode: string;
  price: number;
  salePrice?: number;
  stock: number;
  /** Media library references — persisted in admin storage */
  imageIds?: string[];
  /** Resolved URLs for storefront/runtime (external URLs only in storage) */
  images: string[];
  status: VariantStatus;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string;
  brandId: string;
  petType?: ProductPetType | null;
  categoryId: string;
  subCategoryName?: string;
  description: string;
  longDescription: string;
  category: string;
  variants: ProductVariant[];
  price: number;
  originalPrice?: number;
  images: string[];
  colors: string[];
  sizes: string[];
  inStock: boolean;
  featured: boolean;
  isNew: boolean;
  bestSeller: boolean;
  rating: number;
  reviewCount: number;
  tags: string[];
}

export interface AdminProduct {
  id: string;
  slug: string;
  name: string;
  brand: string;
  brandId: string;
  petType?: ProductPetType | null;
  categoryId: string;
  subCategoryName?: string;
  description: string;
  longDescription: string;
  category: string;
  variants: ProductVariant[];
  featured: boolean;
  isNew: boolean;
  bestSeller: boolean;
  rating: number;
  reviewCount: number;
  tags: string[];
  status: ProductStatus;
  updatedAt: string;
}

export interface Brand {
  id: string;
  name: string;
  displayName: string;
  slug: string;
  tagline: string;
  description: string;
  image: string;
}

export interface AdminBrand extends Brand {
  active: boolean;
  /** True when admin uploaded a custom image (base64) */
  hasCustomImage?: boolean;
  categories: BrandCategory[];
}

export interface BrandFormData {
  displayName: string;
  slug: string;
  tagline: string;
  description: string;
  image: string;
  hasCustomImage: boolean;
  active: boolean;
}

export interface MediaItem {
  id: string;
  name: string;
  url: string;
  type: "image";
  createdAt: string;
}

export interface HeroBanner {
  eyebrow: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  videoUrl: string;
  posterUrl: string;
  active: boolean;
}

export interface FooterBranding {
  logoUrl: string;
  legalName: string;
  description: string;
}

export interface AboutSection {
  imageUrl: string;
  eyebrow: string;
  title: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
}

export interface HomeCollection {
  title: string;
  description: string;
  imageUrl: string;
  href: string;
  imageAlt: string;
}

export type HomeCollectionKey = keyof HomeCollections;

export interface HomeCollections {
  travel: HomeCollection;
  home: HomeCollection;
  eco: HomeCollection;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  rating: number;
  avatar: string;
}

export type BenefitIconName =
  | "award"
  | "shield"
  | "truck"
  | "headphones"
  | "heart"
  | "star"
  | "sparkles"
  | "leaf";

export interface BenefitItem {
  icon: BenefitIconName;
  title: string;
  description: string;
}

export interface BrandStorySection {
  imageUrl: string;
  imageAlt: string;
  eyebrow: string;
  title: string;
  description: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
}

export interface BenefitsSection {
  eyebrow: string;
  title: string;
  description: string;
  items: BenefitItem[];
}

export interface TestimonialsSection {
  eyebrow: string;
  title: string;
  description: string;
  items: Testimonial[];
}

export interface InstagramPost {
  id: string;
  image: string;
  alt: string;
  href: string;
}

export interface InstagramGallerySection {
  title: string;
  description: string;
  profileHref: string;
  profileLabel: string;
  posts: InstagramPost[];
}

export interface StoreLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  hours: string;
  phone: string;
  mapUrl: string;
}

export interface StoreLocatorSection {
  title: string;
  description: string;
  stores: StoreLocation[];
}

export interface NewsletterSection {
  title: string;
  description: string;
  placeholder: string;
  buttonLabel: string;
  footnote: string;
  successMessage: string;
}

export interface FirstAdventureSection {
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  href: string;
  ctaLabel: string;
  /** Up to 2 product IDs; empty = auto from new/starter/featured tags */
  productIds?: string[];
}

export interface HomepageContent {
  brandStory: BrandStorySection;
  benefits: BenefitsSection;
  testimonials: TestimonialsSection;
  instagram: InstagramGallerySection;
  storeLocator: StoreLocatorSection;
  newsletter: NewsletterSection;
  firstAdventure: FirstAdventureSection;
}

export type HomepageContentKey = keyof HomepageContent;

export interface CartItem {
  product: Product;
  /** Present on new cart items; legacy items may omit this */
  variant?: ProductVariant;
  quantity: number;
  /** Legacy cart fields (selectedColor / selectedSize) */
  selectedColor?: string;
  selectedSize?: string;
  selectedScent?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export type SortOption = "featured" | "price-asc" | "price-desc" | "newest";

export interface ProductFilters {
  category?: string;
  brand?: string;
  petType?: ProductPetType | null;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: SortOption;
  query?: string;
}

export interface ProductFormData {
  name: string;
  slug: string;
  brand: string;
  brandId: string;
  petType?: ProductPetType | "";
  categoryId: string;
  subCategoryName: string;
  category: string;
  description: string;
  longDescription: string;
  status: ProductStatus;
  featured: boolean;
  isNew: boolean;
  bestSeller: boolean;
  tags: string[];
}

export interface VariantFormData {
  color: string;
  size: string;
  scent: string;
  sku: string;
  barcode: string;
  price: number;
  salePrice?: number;
  stock: number;
  imageIds: string[];
  status: VariantStatus;
}

/** Legacy seed shape (colors/sizes at product level) */
export interface LegacySeedProduct {
  id: string;
  slug: string;
  name: string;
  brand: string;
  description: string;
  longDescription: string;
  price: number;
  originalPrice?: number;
  category: string;
  images: string[];
  colors: string[];
  sizes: string[];
  inStock: boolean;
  featured: boolean;
  isNew: boolean;
  bestSeller: boolean;
  rating: number;
  reviewCount: number;
  tags: string[];
}

import {
  BenefitIconName,
  BenefitItem,
  HomepageContent,
  HomepageContentKey,
  InstagramPost,
  StoreLocation,
  Testimonial,
} from "@/types";
import { images, unsplash } from "@/lib/images";
import { formatPrice, FREE_SHIPPING_MIN } from "@/lib/utils";
import { sanitizeImageUrl } from "@/lib/image-utils";
import { normalizeFirstAdventureProductIds } from "@/lib/first-adventure-products";
import { normalizeHomepageProductIds } from "@/lib/homepage-product-selection";

const BENEFIT_ICON_NAMES: BenefitIconName[] = [
  "award",
  "shield",
  "truck",
  "headphones",
  "heart",
  "star",
  "sparkles",
  "leaf",
];

function defaultStores(): StoreLocation[] {
  return [
    {
      id: "1",
      name: "NELLY GROUP — Siam Paragon",
      address: "991 Rama I Rd, Pathum Wan",
      city: "Bangkok 10330",
      hours: "Mon – Sun, 10:00 – 21:00",
      phone: "+66 2 123 4567",
      mapUrl: "https://maps.google.com",
    },
    {
      id: "2",
      name: "NELLY GROUP — Central Embassy",
      address: "1031 Ploenchit Rd, Lumphini",
      city: "Bangkok 10330",
      hours: "Mon – Sun, 10:00 – 22:00",
      phone: "+66 2 234 5678",
      mapUrl: "https://maps.google.com",
    },
    {
      id: "3",
      name: "NELLY GROUP — EmQuartier",
      address: "693 Sukhumvit Rd, Khlong Tan Nuea",
      city: "Bangkok 10110",
      hours: "Mon – Sun, 10:00 – 22:00",
      phone: "+66 2 345 6789",
      mapUrl: "https://maps.google.com",
    },
  ];
}

function defaultTestimonials(): Testimonial[] {
  return [
    {
      id: "1",
      name: "Sarah Chen",
      role: "Golden Retriever Parent",
      content:
        "The AIRBUGGY stroller transformed our city walks. Premium quality that matches our lifestyle — finally, pet products that feel as refined as everything else in our home.",
      rating: 5,
      avatar: images.avatars.sarah,
    },
    {
      id: "2",
      name: "James Morrison",
      role: "French Bulldog Owner",
      content:
        "NELLY GROUP curates brands you won't find elsewhere. The Mandarine Brothers collar is genuinely artisan quality. Worth every penny for the craftsmanship alone.",
      rating: 5,
      avatar: images.avatars.james,
    },
    {
      id: "3",
      name: "Emily Nakamura",
      role: "Cat & Dog Household",
      content:
        "From Fuku Fuku treats to Rosewood beds — everything feels thoughtfully selected. The packaging, the quality, the service. This is what premium pet retail should be.",
      rating: 5,
      avatar: images.avatars.emily,
    },
    {
      id: "4",
      name: "David Park",
      role: "Shiba Inu Enthusiast",
      content:
        "Fast shipping, beautiful unboxing experience, and products that exceed expectations. The Radica puzzle keeps my Shiba entertained for hours. Already on my third order.",
      rating: 5,
      avatar: images.avatars.david,
    },
  ];
}

function defaultInstagramPosts(): InstagramPost[] {
  return [
    {
      id: "1",
      image: images.pets.golden,
      alt: "Golden retriever in a refined home setting",
      href: "https://instagram.com/nellygroup",
    },
    {
      id: "2",
      image: images.pets.catBed,
      alt: "Cat resting on a premium pet bed",
      href: "https://instagram.com/nellygroup",
    },
    {
      id: "3",
      image: images.pets.dogCollar,
      alt: "Stylish dog with premium leather collar",
      href: "https://instagram.com/nellygroup",
    },
    {
      id: "4",
      image: images.pets.stroller,
      alt: "Pet stroller on an urban walk",
      href: "https://instagram.com/nellygroup",
    },
    {
      id: "5",
      image: images.pets.grooming,
      alt: "Premium pet grooming session at home",
      href: "https://instagram.com/nellygroup",
    },
    {
      id: "6",
      image: images.pets.dogHappy,
      alt: "Happy dog enjoying outdoor lifestyle",
      href: "https://instagram.com/nellygroup",
    },
  ];
}

function defaultBenefitItems(): BenefitItem[] {
  return [
    {
      icon: "award",
      title: "Curated Premium Brands",
      description:
        "Every brand is hand-selected for exceptional quality, design integrity, and proven customer satisfaction.",
    },
    {
      icon: "shield",
      title: "Authenticity Guaranteed",
      description:
        "100% genuine products sourced directly from authorized distributors. No counterfeits, ever.",
    },
    {
      icon: "truck",
      title: "Complimentary Shipping",
      description: `Free express delivery on orders over ${formatPrice(FREE_SHIPPING_MIN)}. Carefully packaged to arrive in perfect condition.`,
    },
    {
      icon: "headphones",
      title: "Personal Concierge",
      description:
        "Dedicated support from pet lifestyle experts who understand what your companion truly needs.",
    },
  ];
}

export function getDefaultHomepageContent(): HomepageContent {
  return {
    brandStory: {
      imageUrl: unsplash("photo-1548191265-cc70d3d45c01", 900),
      imageAlt: "Pet parent sharing a quiet moment with their companion at home",
      eyebrow: "Our Story",
      title: "Crafted for Companions Who Deserve Extraordinary",
      description:
        "NELLY GROUP exists at the intersection of design, quality, and love. We curate the world's most distinguished pet lifestyle brands — not for mass market, but for those who see their companion as family.",
      body: "Every product in our collection is chosen with intention. Authentic, design-forward, and built to last. We believe luxury is not about excess — it is about choosing what truly matters.",
      ctaLabel: "Discover Our Brands",
      ctaHref: "#brands",
    },
    benefits: {
      eyebrow: "The NELLY Difference",
      title: "Why Choose NELLY GROUP",
      description:
        "We elevate pet retail to an art form — combining world-class brands with an uncompromising commitment to quality and service.",
      items: defaultBenefitItems(),
    },
    testimonials: {
      eyebrow: "Testimonials",
      title: "Loved by Pet Parents",
      description:
        "Join thousands of discerning pet owners who trust NELLY GROUP for their companion's lifestyle.",
      items: defaultTestimonials(),
    },
    instagram: {
      title: "Instagram Gallery",
      description: "@nellygroup — share your moments and tag us to be featured.",
      profileHref: "https://instagram.com/nellygroup",
      profileLabel: "Follow @nellygroup",
      posts: defaultInstagramPosts(),
    },
    storeLocator: {
      title: "Store Locator",
      description:
        "Experience NELLY GROUP in person at our premium retail locations across Bangkok.",
      stores: defaultStores(),
    },
    newsletter: {
      title: "Newsletter",
      description:
        "New collections, exclusive offers, and pet lifestyle inspiration — curated for you.",
      placeholder: "Email address",
      buttonLabel: "Subscribe",
      footnote: "No spam. Unsubscribe anytime.",
      successMessage: "Thank you for subscribing.",
    },
    newCollection: {
      title: "New Collection",
      href: "/shop?sort=newest",
      linkLabel: "View All",
      productIds: [],
    },
    bestSeller: {
      title: "Best Seller",
      href: "/shop",
      linkLabel: "View All",
      productIds: [],
    },
    firstAdventure: {
      title: "First Adventure",
      description:
        "Everything a new pet parent needs — hand-picked essentials from our curated brands to start your journey with confidence.",
      imageUrl: images.pets.puppy,
      imageAlt: "New pet parent essentials curated by NELLY GROUP",
      href: "/shop?sort=newest",
      ctaLabel: "Shop Collection",
      productIds: [],
    },
  };
}

function normalizeBenefitIcon(value: unknown): BenefitIconName {
  if (
    typeof value === "string" &&
    BENEFIT_ICON_NAMES.includes(value as BenefitIconName)
  ) {
    return value as BenefitIconName;
  }
  return "award";
}

function normalizeBenefitItem(
  item: Partial<BenefitItem> | undefined,
  fallback: BenefitItem
): BenefitItem {
  const block = item ?? fallback;
  return {
    icon: normalizeBenefitIcon(block.icon ?? fallback.icon),
    title: block.title?.trim() || fallback.title,
    description: block.description?.trim() || fallback.description,
  };
}

function normalizeTestimonial(
  item: Partial<Testimonial> | undefined,
  fallback: Testimonial,
  index: number
): Testimonial {
  const block = item ?? fallback;
  return {
    id: block.id?.trim() || fallback.id || String(index + 1),
    name: block.name?.trim() || fallback.name,
    role: block.role?.trim() || fallback.role,
    content: block.content?.trim() || fallback.content,
    rating:
      typeof block.rating === "number" && block.rating >= 1 && block.rating <= 5
        ? block.rating
        : fallback.rating,
    avatar: sanitizeImageUrl(block.avatar, fallback.avatar),
  };
}

function normalizeInstagramPost(
  item: Partial<InstagramPost> | undefined,
  fallback: InstagramPost,
  index: number
): InstagramPost {
  const block = item ?? fallback;
  return {
    id: block.id?.trim() || fallback.id || String(index + 1),
    image: sanitizeImageUrl(block.image, fallback.image),
    alt: block.alt?.trim() || fallback.alt,
    href: block.href?.trim() || fallback.href,
  };
}

function normalizeStore(
  item: Partial<StoreLocation> | undefined,
  fallback: StoreLocation,
  index: number
): StoreLocation {
  const block = item ?? fallback;
  return {
    id: block.id?.trim() || fallback.id || String(index + 1),
    name: block.name?.trim() || fallback.name,
    address: block.address?.trim() || fallback.address,
    city: block.city?.trim() || fallback.city,
    hours: block.hours?.trim() || fallback.hours,
    phone: block.phone?.trim() || fallback.phone,
    mapUrl: block.mapUrl?.trim() || fallback.mapUrl,
  };
}

export function normalizeHomepageContent(
  stored: Partial<HomepageContent> | null | undefined
): HomepageContent {
  const defaults = getDefaultHomepageContent();
  const data = stored ?? {};

  return {
    brandStory: {
      ...defaults.brandStory,
      ...(data.brandStory ?? {}),
      imageUrl: sanitizeImageUrl(
        data.brandStory?.imageUrl,
        defaults.brandStory.imageUrl
      ),
      imageAlt:
        data.brandStory?.imageAlt?.trim() || defaults.brandStory.imageAlt,
      eyebrow: data.brandStory?.eyebrow?.trim() || defaults.brandStory.eyebrow,
      title: data.brandStory?.title?.trim() || defaults.brandStory.title,
      description:
        data.brandStory?.description?.trim() ||
        defaults.brandStory.description,
      body: data.brandStory?.body?.trim() || defaults.brandStory.body,
      ctaLabel:
        data.brandStory?.ctaLabel?.trim() || defaults.brandStory.ctaLabel,
      ctaHref: data.brandStory?.ctaHref?.trim() || defaults.brandStory.ctaHref,
    },
    benefits: {
      ...defaults.benefits,
      ...(data.benefits ?? {}),
      eyebrow: data.benefits?.eyebrow?.trim() || defaults.benefits.eyebrow,
      title: data.benefits?.title?.trim() || defaults.benefits.title,
      description:
        data.benefits?.description?.trim() || defaults.benefits.description,
      items: (data.benefits?.items?.length
        ? data.benefits.items
        : defaults.benefits.items
      ).map((item, index) =>
        normalizeBenefitItem(item, defaults.benefits.items[index] ?? item)
      ),
    },
    testimonials: {
      ...defaults.testimonials,
      ...(data.testimonials ?? {}),
      eyebrow:
        data.testimonials?.eyebrow?.trim() || defaults.testimonials.eyebrow,
      title: data.testimonials?.title?.trim() || defaults.testimonials.title,
      description:
        data.testimonials?.description?.trim() ||
        defaults.testimonials.description,
      items: (data.testimonials?.items?.length
        ? data.testimonials.items
        : defaults.testimonials.items
      ).map((item, index) =>
        normalizeTestimonial(
          item,
          defaults.testimonials.items[index] ?? item,
          index
        )
      ),
    },
    instagram: {
      ...defaults.instagram,
      ...(data.instagram ?? {}),
      title: data.instagram?.title?.trim() || defaults.instagram.title,
      description:
        data.instagram?.description?.trim() || defaults.instagram.description,
      profileHref:
        data.instagram?.profileHref?.trim() || defaults.instagram.profileHref,
      profileLabel:
        data.instagram?.profileLabel?.trim() ||
        defaults.instagram.profileLabel,
      posts: (data.instagram?.posts?.length
        ? data.instagram.posts
        : defaults.instagram.posts
      ).map((item, index) =>
        normalizeInstagramPost(
          item,
          defaults.instagram.posts[index] ?? item,
          index
        )
      ),
    },
    storeLocator: {
      ...defaults.storeLocator,
      ...(data.storeLocator ?? {}),
      title: data.storeLocator?.title?.trim() || defaults.storeLocator.title,
      description:
        data.storeLocator?.description?.trim() ||
        defaults.storeLocator.description,
      stores: (data.storeLocator?.stores?.length
        ? data.storeLocator.stores
        : defaults.storeLocator.stores
      ).map((item, index) =>
        normalizeStore(item, defaults.storeLocator.stores[index] ?? item, index)
      ),
    },
    newsletter: {
      ...defaults.newsletter,
      ...(data.newsletter ?? {}),
      title: data.newsletter?.title?.trim() || defaults.newsletter.title,
      description:
        data.newsletter?.description?.trim() || defaults.newsletter.description,
      placeholder:
        data.newsletter?.placeholder?.trim() || defaults.newsletter.placeholder,
      buttonLabel:
        data.newsletter?.buttonLabel?.trim() || defaults.newsletter.buttonLabel,
      footnote:
        data.newsletter?.footnote?.trim() || defaults.newsletter.footnote,
      successMessage:
        data.newsletter?.successMessage?.trim() ||
        defaults.newsletter.successMessage,
    },
    newCollection: {
      ...defaults.newCollection,
      ...(data.newCollection ?? {}),
      title:
        data.newCollection?.title?.trim() || defaults.newCollection.title,
      href: data.newCollection?.href?.trim() || defaults.newCollection.href,
      linkLabel:
        data.newCollection?.linkLabel?.trim() ||
        defaults.newCollection.linkLabel,
      productIds: normalizeHomepageProductIds(
        data.newCollection?.productIds ?? defaults.newCollection.productIds
      ),
    },
    bestSeller: {
      ...defaults.bestSeller,
      ...(data.bestSeller ?? {}),
      title: data.bestSeller?.title?.trim() || defaults.bestSeller.title,
      href: data.bestSeller?.href?.trim() || defaults.bestSeller.href,
      linkLabel:
        data.bestSeller?.linkLabel?.trim() || defaults.bestSeller.linkLabel,
      productIds: normalizeHomepageProductIds(
        data.bestSeller?.productIds ?? defaults.bestSeller.productIds
      ),
    },
    firstAdventure: {
      ...defaults.firstAdventure,
      ...(data.firstAdventure ?? {}),
      imageUrl: sanitizeImageUrl(
        data.firstAdventure?.imageUrl,
        defaults.firstAdventure.imageUrl
      ),
      imageAlt:
        data.firstAdventure?.imageAlt?.trim() ||
        defaults.firstAdventure.imageAlt,
      title:
        data.firstAdventure?.title?.trim() || defaults.firstAdventure.title,
      description:
        data.firstAdventure?.description?.trim() ||
        defaults.firstAdventure.description,
      href: data.firstAdventure?.href?.trim() || defaults.firstAdventure.href,
      ctaLabel:
        data.firstAdventure?.ctaLabel?.trim() ||
        defaults.firstAdventure.ctaLabel,
      productIds: normalizeFirstAdventureProductIds(
        data.firstAdventure?.productIds ?? defaults.firstAdventure.productIds
      ),
    },
  };
}

export function mergeHomepageContent(
  current: HomepageContent,
  patch: Partial<HomepageContent>
): HomepageContent {
  return normalizeHomepageContent({
    ...current,
    ...patch,
    brandStory: patch.brandStory
      ? { ...current.brandStory, ...patch.brandStory }
      : current.brandStory,
    benefits: patch.benefits
      ? { ...current.benefits, ...patch.benefits }
      : current.benefits,
    testimonials: patch.testimonials
      ? { ...current.testimonials, ...patch.testimonials }
      : current.testimonials,
    instagram: patch.instagram
      ? { ...current.instagram, ...patch.instagram }
      : current.instagram,
    storeLocator: patch.storeLocator
      ? { ...current.storeLocator, ...patch.storeLocator }
      : current.storeLocator,
    newsletter: patch.newsletter
      ? { ...current.newsletter, ...patch.newsletter }
      : current.newsletter,
    newCollection: patch.newCollection
      ? { ...current.newCollection, ...patch.newCollection }
      : current.newCollection,
    bestSeller: patch.bestSeller
      ? { ...current.bestSeller, ...patch.bestSeller }
      : current.bestSeller,
    firstAdventure: patch.firstAdventure
      ? { ...current.firstAdventure, ...patch.firstAdventure }
      : current.firstAdventure,
  });
}

export const BENEFIT_ICON_OPTIONS = BENEFIT_ICON_NAMES.map((icon) => ({
  value: icon,
  label: icon.charAt(0).toUpperCase() + icon.slice(1),
}));

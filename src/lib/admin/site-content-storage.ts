import {
  AboutSection,
  FooterBranding,
  HeroBanner,
  HomeCollection,
  HomeCollections,
  HomepageContent,
} from "@/types";

function stripDataUrl(url: string | undefined): string {
  if (typeof url === "string" && url.startsWith("data:")) return "";
  return url ?? "";
}

function stripHomeCollection(block: HomeCollection): HomeCollection {
  return {
    ...block,
    imageUrl: stripDataUrl(block.imageUrl),
  };
}

export function stripHomeCollectionsForLocalStorage(
  data: HomeCollections
): HomeCollections {
  return {
    travel: stripHomeCollection(data.travel),
    home: stripHomeCollection(data.home),
    eco: stripHomeCollection(data.eco),
  };
}

export function stripBannerForLocalStorage(banner: HeroBanner): HeroBanner {
  return {
    ...banner,
    posterUrl: stripDataUrl(banner.posterUrl),
  };
}

export function stripFooterForLocalStorage(footer: FooterBranding): FooterBranding {
  return {
    ...footer,
    logoUrl: stripDataUrl(footer.logoUrl),
  };
}

export function stripAboutForLocalStorage(about: AboutSection): AboutSection {
  return {
    ...about,
    imageUrl: stripDataUrl(about.imageUrl),
  };
}

export function stripHomepageContentForLocalStorage(
  content: HomepageContent
): HomepageContent {
  return {
    ...content,
    brandStory: {
      ...content.brandStory,
      imageUrl: stripDataUrl(content.brandStory.imageUrl),
    },
    testimonials: {
      ...content.testimonials,
      items: content.testimonials.items.map((item) => ({
        ...item,
        avatar: stripDataUrl(item.avatar),
      })),
    },
    instagram: {
      ...content.instagram,
      posts: content.instagram.posts.map((post) => ({
        ...post,
        image: stripDataUrl(post.image),
      })),
    },
    firstAdventure: {
      ...content.firstAdventure,
      imageUrl: stripDataUrl(content.firstAdventure.imageUrl),
    },
  };
}

export function hasInlineDataUrls(value: unknown): boolean {
  if (typeof value === "string") return value.startsWith("data:");
  if (Array.isArray(value)) return value.some(hasInlineDataUrls);
  if (value && typeof value === "object") {
    return Object.values(value).some(hasInlineDataUrls);
  }
  return false;
}

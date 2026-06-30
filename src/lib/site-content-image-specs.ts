import {
  BRAND_LOGO_HEIGHT,
  BRAND_LOGO_WIDTH,
  HERO_BANNER_HEIGHT,
  HERO_BANNER_WIDTH,
} from "@/lib/brand-assets";

export type ImageCropObjectFit = "contain" | "cover";

export interface ImageUploadSpec {
  /** Crop aspect ratio (width / height) */
  aspect: number;
  recommendedWidth: number;
  recommendedHeight: number;
  /** Short label shown in upload hint, e.g. "4:5 portrait" */
  aspectLabel: string;
  cropTitle: string;
  cropSubtitle?: string;
  /** react-easy-crop objectFit inside the crop frame */
  cropObjectFit?: ImageCropObjectFit;
  /** Preview thumbnail object-fit in the upload dropzone */
  previewObjectFit?: ImageCropObjectFit;
}

export const SITE_IMAGE_SPECS = {
  footerLogo: {
    aspect: 1,
    recommendedWidth: BRAND_LOGO_WIDTH,
    recommendedHeight: BRAND_LOGO_HEIGHT,
    aspectLabel: "1:1 square",
    cropTitle: "Crop footer logo",
    cropSubtitle: "Square logo · adjust zoom and position, then apply.",
    cropObjectFit: "contain",
    previewObjectFit: "contain",
  },
  aboutPortrait: {
    aspect: 4 / 5,
    recommendedWidth: 960,
    recommendedHeight: 1200,
    aspectLabel: "4:5 portrait",
    cropTitle: "Crop about image",
    cropSubtitle: "Portrait 4:5 · adjust zoom and position, then apply.",
    cropObjectFit: "contain",
    previewObjectFit: "contain",
  },
  brandStoryPortrait: {
    aspect: 4 / 5,
    recommendedWidth: 960,
    recommendedHeight: 1200,
    aspectLabel: "4:5 portrait",
    cropTitle: "Crop story image",
    cropSubtitle: "Portrait 4:5 · adjust zoom and position, then apply.",
    cropObjectFit: "cover",
    previewObjectFit: "cover",
  },
  collectionLandscape: {
    aspect: 5 / 4,
    recommendedWidth: 1200,
    recommendedHeight: 960,
    aspectLabel: "5:4 landscape",
    cropTitle: "Crop collection image",
    cropSubtitle: "Landscape 5:4 · adjust zoom and position, then apply.",
    cropObjectFit: "cover",
    previewObjectFit: "cover",
  },
  instagramSquare: {
    aspect: 1,
    recommendedWidth: 1080,
    recommendedHeight: 1080,
    aspectLabel: "1:1 square",
    cropTitle: "Crop Instagram image",
    cropSubtitle: "Square 1:1 · adjust zoom and position, then apply.",
    cropObjectFit: "cover",
    previewObjectFit: "cover",
  },
  avatarSquare: {
    aspect: 1,
    recommendedWidth: 400,
    recommendedHeight: 400,
    aspectLabel: "1:1 square",
    cropTitle: "Crop avatar",
    cropSubtitle: "Square 1:1 · adjust zoom and position, then apply.",
    cropObjectFit: "cover",
    previewObjectFit: "cover",
  },
  heroBanner: {
    aspect: HERO_BANNER_WIDTH / HERO_BANNER_HEIGHT,
    recommendedWidth: 1920,
    recommendedHeight: 1080,
    aspectLabel: "16:9 wide",
    cropTitle: "Crop banner image",
    cropSubtitle: "Wide 16:9 · adjust zoom and position, then apply.",
    cropObjectFit: "contain",
    previewObjectFit: "contain",
  },
} as const satisfies Record<string, ImageUploadSpec>;

export function formatUploadHint(spec: ImageUploadSpec, maxMb = 5): string {
  return `PNG or JPG · max ${maxMb} MB (auto-compressed ~600 KB for storage) · ${spec.recommendedWidth}×${spec.recommendedHeight} px recommended (${spec.aspectLabel})`;
}

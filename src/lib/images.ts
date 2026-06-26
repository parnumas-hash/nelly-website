/**
 * Centralized Unsplash image URLs for Next.js <Image>.
 * Domain must be listed in next.config.ts → images.remotePatterns
 */
export function unsplash(path: string, width = 800): string {
  const id = path.startsWith("photo-") ? path : `photo-${path}`;
  return `https://images.unsplash.com/${id}?w=${width}&q=80&auto=format&fit=crop`;
}

export const images = {
  hero: {
    poster: unsplash("photo-1601758228041-f3b2795255f1", 1920),
  },
  pets: {
    golden: unsplash("photo-1450778869180-41d0601e046e"),
    catBed: unsplash("photo-1548191265-cc70d3d45c01"),
    dogCollar: unsplash("photo-1583337130417-3346a1be7dee"),
    dogHappy: unsplash("photo-1583511655857-d19b40a7a54e"),
    stroller: unsplash("photo-1601758228041-f3b2795255f1"),
    grooming: unsplash("photo-1516734212186-a967f81ad0d4"),
    puppy: unsplash("photo-1587300003388-59208cc962cb"),
    treats: unsplash("photo-1589924691995-400dc9ecc119"),
    toys: unsplash("photo-1535294435445-d7249524ef2e"),
  },
  avatars: {
    sarah: unsplash("photo-1494790108377-be9c29b29330", 100),
    james: unsplash("photo-1507003211169-0a1dd7228f2d", 100),
    emily: unsplash("photo-1438761681033-6461ffad8d80", 100),
    david: unsplash("photo-1472099645785-5658abf4ff4e", 100),
  },
};

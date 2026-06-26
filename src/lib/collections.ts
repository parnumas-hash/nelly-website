import { images, unsplash } from "@/lib/images";
import { products } from "./products";

export function getTravelProducts() {
  return products
    .filter((p) => ["strollers", "accessories"].includes(p.category))
    .slice(0, 4);
}

export function getHomeLivingProducts() {
  return products.filter((p) => p.category === "beds").slice(0, 4);
}

export function getEcoProducts() {
  return products
    .filter(
      (p) =>
        p.category === "eco" ||
        p.brand === "Earth Rated" ||
        p.tags.includes("eco")
    )
    .slice(0, 4);
}

export const collections = {
  travel: {
    title: "Travel with Pets",
    description:
      "Premium strollers, carriers, and travel essentials for adventures near and far.",
    image: unsplash("photo-1601758228041-f3b2795255f1", 1200),
    href: "/shop?category=strollers",
  },
  home: {
    title: "Home Living",
    description:
      "Designer beds and furniture that complement your interior — comfort redefined.",
    image: unsplash("photo-1548191265-cc70d3d45c01", 1200),
    href: "/shop?category=beds",
  },
  eco: {
    title: "Eco Friendly",
    description:
      "Sustainable, plant-based products for responsible pet parents who care.",
    image: images.pets.golden,
    href: "/shop?category=eco",
  },
};

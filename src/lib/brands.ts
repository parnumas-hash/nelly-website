import { Brand } from "@/types";
import { sortBrandsAlphabetically } from "@/lib/brand-categories";

const seedBrands: Brand[] = [
  {
    id: "airbuggy",
    name: "AIRBUGGY PET",
    displayName: "AIRBUGGY PET",
    slug: "airbuggy-pet",
    tagline: "Premium Pet Mobility",
    description:
      "Japanese-engineered pet strollers designed for urban adventures with uncompromising style.",
    image: "",
  },
  {
    id: "mandarine",
    name: "MANDARINE BROTHERS",
    displayName: "MANDARINE BROTHERS",
    slug: "mandarine-brothers",
    tagline: "Refined Pet Fashion",
    description:
      "Artisan-crafted collars, leashes, and apparel for the discerning pet owner.",
    image: "",
  },
  {
    id: "radica",
    name: "RADICA",
    displayName: "RADICA",
    slug: "radica",
    tagline: "Interactive Play",
    description:
      "Award-winning interactive toys that stimulate and delight curious companions.",
    image: "",
  },
  {
    id: "rosewood",
    name: "ROSEWOOD",
    displayName: "ROSEWOOD",
    slug: "rosewood",
    tagline: "Natural Living",
    description:
      "Sustainably sourced beds, furniture, and natural chews for everyday luxury.",
    image: "",
  },
  {
    id: "fukufuku",
    name: "FUKU FUKU PET",
    displayName: "FUKU FUKU PET",
    slug: "fuku-fuku-pet",
    tagline: "Japanese Delicacies",
    description:
      "Authentic Japanese treats and supplements crafted with premium ingredients.",
    image: "",
  },
  {
    id: "harrys",
    name: "HARRY'S PET",
    displayName: "HARRY'S PET",
    slug: "harrys-pet",
    tagline: "Grooming Excellence",
    description:
      "Professional-grade grooming essentials for a salon-quality finish at home.",
    image: "",
  },
  {
    id: "earth-rated",
    name: "Earth Rated",
    displayName: "Earth Rated",
    slug: "earth-rated",
    tagline: "Eco-Conscious Care",
    description:
      "Plant-based, compostable products for responsible pet parents.",
    image: "",
  },
  {
    id: "fuzzyard",
    name: "FuzzYard",
    displayName: "FuzzYard",
    slug: "fuzzyard",
    tagline: "Designer Comfort",
    description:
      "Bold, designer beds and accessories that blend seamlessly with modern interiors.",
    image: "",
  },
];

export const brands = sortBrandsAlphabetically(seedBrands);

export function getBrandBySlug(slug: string): Brand | undefined {
  return brands.find((b) => b.slug === slug);
}

import { LegacySeedProduct, ProductFilters } from "@/types";
import { brandToSlug } from "@/lib/utils";
import { images } from "@/lib/images";

export const categories = [
  { id: "all", name: "All", slug: "all" },
  { id: "strollers", name: "Strollers", slug: "strollers" },
  { id: "beds", name: "Beds & Furniture", slug: "beds" },
  { id: "toys", name: "Toys", slug: "toys" },
  { id: "grooming", name: "Grooming", slug: "grooming" },
  { id: "treats", name: "Treats", slug: "treats" },
  { id: "accessories", name: "Accessories", slug: "accessories" },
  { id: "eco", name: "Eco Essentials", slug: "eco" },
];

export const products: LegacySeedProduct[] = [
  {
    id: "1",
    slug: "airbuggy-dome3-stroller",
    name: "DOME3 Pet Stroller",
    brand: "AIRBUGGY PET",
    description: "All-terrain pet stroller with premium suspension and UV canopy.",
    longDescription:
      "The AIRBUGGY DOME3 redefines pet mobility with Japanese precision engineering. Features all-terrain wheels, adjustable suspension, UV-protective canopy, and a spacious interior cabin. Folds compactly for effortless storage.",
    price: 649,
    category: "strollers",
    images: [
      images.pets.stroller,
      images.pets.puppy,
    ],
    colors: ["Matte Black", "Sand Beige"],
    sizes: ["Standard"],
    inStock: true,
    featured: true,
    isNew: true,
    bestSeller: true,
    rating: 4.9,
    reviewCount: 214,
    tags: ["stroller", "airbuggy", "mobility"],
  },
  {
    id: "2",
    slug: "mandarine-leather-collar",
    name: "Artisan Leather Collar",
    brand: "MANDARINE BROTHERS",
    description: "Hand-stitched full-grain leather collar with brass hardware.",
    longDescription:
      "Crafted in small batches using full-grain vegetable-tanned leather. Each collar features hand-stitched edges, solid brass hardware, and a signature Mandarine Brothers emboss. Ages beautifully with a rich patina.",
    price: 89,
    category: "accessories",
    images: [
      images.pets.dogCollar,
      images.pets.dogHappy,
    ],
    colors: ["Cognac", "Black", "Natural"],
    sizes: ["XS", "S", "M", "L"],
    inStock: true,
    featured: true,
    isNew: false,
    bestSeller: true,
    rating: 4.8,
    reviewCount: 156,
    tags: ["collar", "leather", "mandarine"],
  },
  {
    id: "3",
    slug: "radica-interactive-puzzle",
    name: "Interactive Puzzle Feeder",
    brand: "RADICA",
    description: "Multi-level puzzle toy that rewards curiosity and mental stimulation.",
    longDescription:
      "Designed by pet behaviorists, this multi-level puzzle challenges your companion to solve sequential tasks for treat rewards. Made from BPA-free, food-grade materials with non-slip base.",
    price: 45,
    category: "toys",
    images: [
      images.pets.toys,
      images.pets.stroller,
    ],
    colors: ["Clear/Blue"],
    sizes: ["One Size"],
    inStock: true,
    featured: true,
    isNew: true,
    bestSeller: false,
    rating: 4.7,
    reviewCount: 98,
    tags: ["toy", "puzzle", "radica"],
  },
  {
    id: "4",
    slug: "rosewood-luxury-donut-bed",
    name: "Luxury Donut Bed",
    brand: "ROSEWOOD",
    description: "Plush donut bed with removable washable cover and memory foam base.",
    longDescription:
      "The Rosewood Luxury Donut Bed wraps your pet in cloud-like comfort. Features a removable, machine-washable faux fur cover over a supportive memory foam base. Perfect for anxious pets seeking a cozy retreat.",
    price: 129,
    originalPrice: 159,
    category: "beds",
    images: [
      images.pets.catBed,
      images.pets.golden,
    ],
    colors: ["Grey", "Cream", "Blush"],
    sizes: ["S", "M", "L", "XL"],
    inStock: true,
    featured: true,
    isNew: false,
    bestSeller: true,
    rating: 4.9,
    reviewCount: 312,
    tags: ["bed", "rosewood", "comfort"],
  },
  {
    id: "5",
    slug: "fukufuku-salmon-treats",
    name: "Premium Salmon Treats",
    brand: "FUKU FUKU PET",
    description: "Air-dried wild salmon treats from Hokkaido, Japan.",
    longDescription:
      "Sourced from wild-caught salmon in Hokkaido waters, these treats are air-dried to preserve natural omega-3 fatty acids. No additives, preservatives, or fillers — just pure, premium protein.",
    price: 28,
    category: "treats",
    images: [
      images.pets.treats,
      images.pets.stroller,
    ],
    colors: ["Original"],
    sizes: ["50g", "100g"],
    inStock: true,
    featured: false,
    isNew: true,
    bestSeller: true,
    rating: 4.8,
    reviewCount: 187,
    tags: ["treats", "salmon", "fukufuku"],
  },
  {
    id: "6",
    slug: "harrys-grooming-set",
    name: "Professional Grooming Set",
    brand: "HARRY'S PET",
    description: "Complete grooming kit with slicker brush, comb, and nail clipper.",
    longDescription:
      "Everything you need for salon-quality grooming at home. Includes an ergonomic slicker brush, stainless steel comb, safety nail clipper, and a travel pouch. Suitable for all coat types.",
    price: 75,
    category: "grooming",
    images: [
      images.pets.grooming,
      images.pets.puppy,
    ],
    colors: ["Black/Gold"],
    sizes: ["One Size"],
    inStock: true,
    featured: true,
    isNew: false,
    bestSeller: false,
    rating: 4.6,
    reviewCount: 74,
    tags: ["grooming", "harrys", "brush"],
  },
  {
    id: "7",
    slug: "earth-rated-poop-bags",
    name: "Compostable Poop Bags",
    brand: "Earth Rated",
    description: "Plant-based, compostable bags with lavender scent. 120 count.",
    longDescription:
      "Earth Rated compostable bags break down in commercial composting facilities. Made from plant-based materials with a subtle lavender scent. Leak-proof, extra-thick design with easy-tear perforations.",
    price: 18,
    category: "eco",
    images: [
      images.pets.golden,
      images.pets.dogHappy,
    ],
    colors: ["Green"],
    sizes: ["120 bags", "270 bags"],
    inStock: true,
    featured: false,
    isNew: false,
    bestSeller: true,
    rating: 4.9,
    reviewCount: 892,
    tags: ["eco", "bags", "earth-rated"],
  },
  {
    id: "8",
    slug: "fuzzyard-designer-bed",
    name: "Designer Lounge Bed",
    brand: "FuzzYard",
    description: "Architectural pet bed with reversible cushion and non-slip base.",
    longDescription:
      "FuzzYard's Designer Lounge Bed features clean geometric lines that complement modern interiors. Reversible cushion with two fabric options, water-resistant base, and a non-slip rubber bottom.",
    price: 149,
    category: "beds",
    images: [
      images.pets.catBed,
      images.pets.dogCollar,
    ],
    colors: ["Midnight", "Stone", "Terracotta"],
    sizes: ["M", "L"],
    inStock: true,
    featured: true,
    isNew: true,
    bestSeller: false,
    rating: 4.7,
    reviewCount: 143,
    tags: ["bed", "fuzzyard", "designer"],
  },
  {
    id: "9",
    slug: "airbuggy-universal-adapter",
    name: "Universal Car Seat Adapter",
    brand: "AIRBUGGY PET",
    description: "Quick-release adapter for seamless car-to-stroller transitions.",
    longDescription:
      "The Universal Car Seat Adapter allows one-click attachment of your AIRBUGGY stroller to most car seat models. ISO-fix compatible with a secure locking mechanism for peace of mind on every journey.",
    price: 79,
    category: "strollers",
    images: [
      images.pets.puppy,
      images.pets.stroller,
    ],
    colors: ["Black"],
    sizes: ["Universal"],
    inStock: true,
    featured: false,
    isNew: true,
    bestSeller: false,
    rating: 4.5,
    reviewCount: 56,
    tags: ["adapter", "airbuggy", "accessory"],
  },
  {
    id: "10",
    slug: "mandarine-silk-bandana",
    name: "Silk Bandana Collection",
    brand: "MANDARINE BROTHERS",
    description: "Pure silk bandana set with hand-rolled edges. Set of 3.",
    longDescription:
      "A curated set of three pure silk bandanas featuring exclusive Mandarine Brothers prints. Hand-rolled edges, adjustable tie closure, and presented in a gift box.",
    price: 65,
    category: "accessories",
    images: [
      images.pets.dogHappy,
      images.pets.dogCollar,
    ],
    colors: ["Floral", "Geometric", "Classic"],
    sizes: ["One Size"],
    inStock: true,
    featured: false,
    isNew: true,
    bestSeller: false,
    rating: 4.6,
    reviewCount: 42,
    tags: ["bandana", "silk", "mandarine"],
  },
  {
    id: "11",
    slug: "radica-treat-dispenser",
    name: "Automatic Treat Dispenser",
    brand: "RADICA",
    description: "Smart treat dispenser with adjustable difficulty levels.",
    longDescription:
      "Keep your companion engaged with this automatic treat dispenser. Three difficulty settings, dishwasher-safe components, and a transparent chamber to monitor treat levels.",
    price: 38,
    category: "toys",
    images: [
      images.pets.toys,
      images.pets.golden,
    ],
    colors: ["White/Green"],
    sizes: ["One Size"],
    inStock: true,
    featured: false,
    isNew: false,
    bestSeller: true,
    rating: 4.7,
    reviewCount: 201,
    tags: ["toy", "dispenser", "radica"],
  },
  {
    id: "12",
    slug: "fukufuku-matcha-biscuits",
    name: "Matcha Green Tea Biscuits",
    brand: "FUKU FUKU PET",
    description: "Organic matcha biscuits with antioxidant-rich green tea.",
    longDescription:
      "Crafted with ceremonial-grade Uji matcha from Kyoto, these biscuits offer a delicate flavor profile and natural antioxidants. Baked in small batches with organic whole-grain flour.",
    price: 22,
    category: "treats",
    images: [
      images.pets.treats,
      images.pets.dogHappy,
    ],
    colors: ["Original"],
    sizes: ["80g"],
    inStock: true,
    featured: false,
    isNew: true,
    bestSeller: false,
    rating: 4.8,
    reviewCount: 67,
    tags: ["treats", "matcha", "fukufuku"],
  },
];

export function getProductBySlug(slug: string): LegacySeedProduct | undefined {
  return products.find((p) => p.slug === slug);
}

export function getFeaturedProducts(): LegacySeedProduct[] {
  return products.filter((p) => p.featured);
}

export function getNewArrivals(): LegacySeedProduct[] {
  return products.filter((p) => p.isNew);
}

export function getBestSellers(): LegacySeedProduct[] {
  return products.filter((p) => p.bestSeller);
}

export function getProductsByCategory(category: string): LegacySeedProduct[] {
  if (category === "all") return products;
  return products.filter((p) => p.category === category);
}

export function getProductsByBrand(brandSlug: string): LegacySeedProduct[] {
  return products.filter((p) => brandToSlug(p.brand) === brandSlug.toLowerCase());
}

export function filterProducts(filters: ProductFilters): LegacySeedProduct[] {
  let result = [...products];

  if (filters.category && filters.category !== "all") {
    result = result.filter((p) => p.category === filters.category);
  }

  if (filters.brand) {
    result = result.filter(
      (p) => brandToSlug(p.brand) === filters.brand!.toLowerCase()
    );
  }

  if (filters.minPrice !== undefined) {
    result = result.filter((p) => p.price >= filters.minPrice!);
  }

  if (filters.maxPrice !== undefined) {
    result = result.filter((p) => p.price <= filters.maxPrice!);
  }

  if (filters.query) {
    const q = filters.query.toLowerCase();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some((t) => t.includes(q)) ||
        p.category.toLowerCase().includes(q)
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
}

export function searchProducts(query: string): LegacySeedProduct[] {
  return filterProducts({ query });
}

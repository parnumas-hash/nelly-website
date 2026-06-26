import { Testimonial } from "@/types";
import { images } from "@/lib/images";

export const testimonials: Testimonial[] = [
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

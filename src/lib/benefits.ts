import { Award, Shield, Truck, Headphones } from "lucide-react";
import { formatPrice, FREE_SHIPPING_MIN } from "@/lib/utils";

export const benefits = [
  {
    icon: Award,
    title: "Curated Premium Brands",
    description:
      "Every brand is hand-selected for exceptional quality, design integrity, and proven customer satisfaction.",
  },
  {
    icon: Shield,
    title: "Authenticity Guaranteed",
    description:
      "100% genuine products sourced directly from authorized distributors. No counterfeits, ever.",
  },
  {
    icon: Truck,
    title: "Complimentary Shipping",
    description:
      `Free express delivery on orders over ${formatPrice(FREE_SHIPPING_MIN)}. Carefully packaged to arrive in perfect condition.`,
  },
  {
    icon: Headphones,
    title: "Personal Concierge",
    description:
      "Dedicated support from pet lifestyle experts who understand what your companion truly needs.",
  },
];

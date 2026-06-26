import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const CURRENCY_CODE = "THB";
export const FREE_SHIPPING_MIN = 2500;
export const STANDARD_SHIPPING_FEE = 150;

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: CURRENCY_CODE,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function getShippingFee(subtotal: number): number {
  return subtotal >= FREE_SHIPPING_MIN ? 0 : STANDARD_SHIPPING_FEE;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function brandToSlug(brand: string): string {
  return brand
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/\s+/g, "-");
}

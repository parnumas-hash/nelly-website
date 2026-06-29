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

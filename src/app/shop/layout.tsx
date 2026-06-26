import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Browse premium pet products from AIRBUGGY PET, MANDARINE BROTHERS, RADICA, ROSEWOOD, and more.",
};

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

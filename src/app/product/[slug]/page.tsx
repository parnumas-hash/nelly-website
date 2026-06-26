"use client";

import { use } from "react";
import ProductDetail from "@/components/product/ProductDetail";

export default function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  return <ProductDetail slug={slug} />;
}

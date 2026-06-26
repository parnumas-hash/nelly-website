import type { Metadata } from "next";
import ProductDetail from "@/components/product/ProductDetail";
import { getServerProductBySlug } from "@/lib/catalog/server-catalog";
import { getSiteUrl } from "@/lib/site-config";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getServerProductBySlug(slug);

  if (!product) {
    return { title: "Product Not Found" };
  }

  const baseUrl = getSiteUrl();
  const image = product.images?.[0];

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: `${product.name} | ${product.brand}`,
      description: product.description,
      url: `${baseUrl}/product/${product.slug}`,
      ...(image ? { images: [{ url: image }] } : {}),
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  return <ProductDetail slug={slug} />;
}

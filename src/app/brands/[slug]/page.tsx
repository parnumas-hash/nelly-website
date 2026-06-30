import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getServerBrandBySlug } from "@/lib/catalog/server-catalog";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const brand = await getServerBrandBySlug(slug);

  if (!brand) {
    return { title: "Brand Not Found" };
  }

  return {
    title: brand.displayName,
    description: brand.description || brand.tagline,
  };
}

export default async function BrandPage({ params }: PageProps) {
  const { slug } = await params;
  const brand = await getServerBrandBySlug(slug);

  if (!brand) notFound();

  redirect(`/shop?brand=${brand.slug}`);
}

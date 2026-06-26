import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BrandDetailPage from "@/components/brand/BrandDetailPage";
import BrandJsonLd from "@/components/seo/BrandJsonLd";
import { getServerBrandBySlug } from "@/lib/catalog/server-catalog";
import { getSiteUrl } from "@/lib/site-config";
import { getBrandDisplayImage } from "@/lib/image-utils";

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

  const image = getBrandDisplayImage(brand);
  const baseUrl = getSiteUrl();

  return {
    title: brand.displayName,
    description: brand.description || brand.tagline,
    openGraph: {
      title: brand.displayName,
      description: brand.description || brand.tagline,
      url: `${baseUrl}/brands/${brand.slug}`,
      ...(image ? { images: [{ url: image }] } : {}),
    },
  };
}

export default async function BrandPage({ params }: PageProps) {
  const { slug } = await params;
  const brand = await getServerBrandBySlug(slug);

  if (!brand) notFound();

  return (
    <>
      <BrandJsonLd brand={brand} />
      <BrandDetailPage slug={slug} initialBrand={brand} />
    </>
  );
}

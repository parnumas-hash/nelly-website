import { AdminBrand } from "@/types";
import { getBrandDisplayImage } from "@/lib/image-utils";
import { getSiteUrl } from "@/lib/site-config";

interface BrandJsonLdProps {
  brand: AdminBrand;
}

export default function BrandJsonLd({ brand }: BrandJsonLdProps) {
  const baseUrl = getSiteUrl();
  const image = getBrandDisplayImage(brand);

  const schema = {
    "@context": "https://schema.org",
    "@type": "Brand",
    name: brand.displayName,
    description: brand.description || brand.tagline,
    url: `${baseUrl}/brands/${brand.slug}`,
    ...(image ? { logo: image, image } : {}),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

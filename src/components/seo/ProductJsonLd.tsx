import { Product } from "@/types";
import { getProductPriceRange } from "@/lib/variants";
import { getSiteUrl } from "@/lib/site-config";

interface ProductJsonLdProps {
  product: Product;
}

export default function ProductJsonLd({ product }: ProductJsonLdProps) {
  const baseUrl = getSiteUrl();
  const { min, max } = getProductPriceRange(product.variants, {
    price: product.price,
    originalPrice: product.originalPrice,
  });
  const image = product.images?.[0];
  const inStock = product.inStock;

  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images?.length ? product.images : image ? [image] : undefined,
    brand: {
      "@type": "Brand",
      name: product.brand,
    },
    sku: product.variants?.[0]?.sku,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "THB",
      lowPrice: min,
      highPrice: max,
      offerCount: product.variants?.length || 1,
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: `${baseUrl}/product/${product.slug}`,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

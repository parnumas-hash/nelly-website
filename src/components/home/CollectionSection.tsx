import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Product } from "@/types";
import Section from "@/components/ui/Section";
import ProductCard from "@/components/product/ProductCard";
import SafeImage from "@/components/ui/SafeImage";
import { sanitizeImageUrl } from "@/lib/image-utils";
import { cn } from "@/lib/utils";

interface CollectionSectionProps {
  id?: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  products: Product[];
  href: string;
  background?: "white" | "gray";
  reversed?: boolean;
}

export default function CollectionSection({
  id,
  title,
  description,
  image,
  imageAlt,
  products,
  href,
  background = "white",
  reversed = false,
}: CollectionSectionProps) {
  const heroImage = sanitizeImageUrl(image);

  return (
    <Section
      id={id}
      background={background}
      ariaLabel={title}
      className="overflow-hidden"
    >
      <div
        className={cn(
          "grid items-center gap-10 lg:grid-cols-2 lg:gap-16",
          reversed && "lg:[direction:rtl]"
        )}
      >
        <div className={cn(reversed && "lg:[direction:ltr]")}>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-neutral-100 dark:bg-neutral-900 lg:aspect-[5/4]">
            <SafeImage
              src={heroImage}
              alt={imageAlt}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>

        <div className={cn(reversed && "lg:[direction:ltr]")}>
          <h2 className="font-display text-[32px] font-bold tracking-tight text-neutral-900 dark:text-white md:text-[40px]">
            {title}
          </h2>
          <p className="mt-4 max-w-md text-[17px] leading-relaxed text-neutral-500">
            {description}
          </p>
          <Link
            href={href}
            className="mt-6 inline-flex items-center gap-1.5 text-[15px] font-medium text-primary transition-opacity hover:opacity-80"
          >
            Shop Collection
            <ArrowRight className="h-4 w-4" />
          </Link>

          <div className="mt-10 grid grid-cols-2 gap-4">
            {products.length > 0 ? (
              products.slice(0, 2).map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))
            ) : (
              <p className="col-span-2 text-sm text-neutral-500">
                Collection products coming soon.
              </p>
            )}
          </div>
        </div>
      </div>
    </Section>
  );
}

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Product } from "@/types";
import SectionHeader from "@/components/ui/SectionHeader";
import ProductCard from "@/components/product/ProductCard";
import { cn } from "@/lib/utils";

interface ProductSectionProps {
  eyebrow?: string;
  title: string;
  description?: string;
  products: Product[];
  href?: string;
  linkLabel?: string;
  background?: "white" | "gray";
  columns?: 2 | 3 | 4;
  limit?: number;
  className?: string;
  centered?: boolean;
}

export default function ProductSection({
  eyebrow,
  title,
  description,
  products,
  href,
  linkLabel = "View All",
  background = "white",
  columns = 4,
  limit,
  className,
  centered = true,
}: ProductSectionProps) {
  const displayProducts = limit ? products.slice(0, limit) : products;

  const gridCols = {
    2: "grid-cols-2",
    3: "grid-cols-2 md:grid-cols-3",
    4: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
  };

  return (
    <section
      className={cn(
        "py-16 md:py-24",
        background === "gray" && "bg-neutral-50 dark:bg-neutral-900/40",
        className
      )}
    >
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <SectionHeader
          eyebrow={eyebrow}
          title={title}
          description={description}
          href={href}
          linkLabel={linkLabel}
          align={centered ? "center" : "left"}
        />

        <div className={cn("grid gap-4 md:gap-6", gridCols[columns])}>
          {displayProducts.length > 0 ? (
            displayProducts.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))
          ) : (
            <p className="col-span-full py-8 text-center text-sm text-neutral-500">
              Products will appear here once published in the admin.
            </p>
          )}
        </div>

        {href && (
          <div className="mt-8 text-center md:hidden">
            <Link
              href={href}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary"
            >
              {linkLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

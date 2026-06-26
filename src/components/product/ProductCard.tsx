"use client";

import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import { Product } from "@/types";
import { formatPrice, cn } from "@/lib/utils";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import Badge from "@/components/ui/Badge";
import SafeImage from "@/components/ui/SafeImage";
import {
  getProductPrimaryImage,
  getProductDisplayImages,
} from "@/lib/image-utils";
import {
  getVariantDisplayPrice,
  hasProductVariants,
  isVariantInStock,
  resolveProductVariantForAdd,
} from "@/lib/variants";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { isInWishlist, toggleItem } = useWishlist();
  const { addItem } = useCart();
  const inWishlist = isInWishlist(product.id);

  const variants = product.variants ?? [];
  const defaultVariant = hasProductVariants(product)
    ? variants.find((v) => isVariantInStock(v)) ?? variants[0]
    : undefined;

  const thumb = getProductPrimaryImage(product);
  const galleryCount = getProductDisplayImages(product).length;
  const { price, originalPrice } = getVariantDisplayPrice(
    defaultVariant ?? null,
    {
      price: product.price,
      originalPrice: product.originalPrice,
    }
  );

  const handleQuickAdd = () => {
    const variant = resolveProductVariantForAdd(product, defaultVariant ?? null);
    addItem(product, variant);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
      className="group relative"
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-neutral-100 dark:bg-neutral-900">
        <Link href={`/product/${product.slug}`}>
          <SafeImage
            src={thumb}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        </Link>

        {galleryCount > 1 && (
          <span className="absolute bottom-3 left-3 rounded-full bg-black/50 px-2 py-0.5 text-[10px] text-white">
            +{galleryCount - 1}
          </span>
        )}

        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {product.isNew && <Badge variant="new">New</Badge>}
          {originalPrice && <Badge variant="sale">Sale</Badge>}
        </div>

        <div className="absolute right-3 top-3 flex flex-col gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <button
            onClick={() => toggleItem(product)}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md transition-colors",
              inWishlist
                ? "bg-primary text-white"
                : "bg-white/80 text-neutral-900 hover:bg-white dark:bg-black/60 dark:text-white dark:hover:bg-black/80"
            )}
            aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              className={cn("h-4 w-4", inWishlist && "fill-current")}
            />
          </button>
          <button
            onClick={handleQuickAdd}
            disabled={!product.inStock}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-neutral-900 backdrop-blur-md transition-colors hover:bg-white disabled:opacity-50 dark:bg-black/60 dark:text-white dark:hover:bg-black/80"
            aria-label="Add to cart"
          >
            <ShoppingBag className="h-4 w-4" />
          </button>
        </div>

        {!product.inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
            <span className="rounded-full bg-white px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-black">
              Sold Out
            </span>
          </div>
        )}
      </div>

      <div className="mt-4 space-y-1">
        <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-neutral-400">
          {product.brand}
        </p>
        <Link
          href={`/product/${product.slug}`}
          className="block text-sm font-medium text-neutral-900 transition-colors hover:text-primary dark:text-white dark:hover:text-primary"
        >
          {product.name}
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-neutral-900 dark:text-white">
            {formatPrice(price)}
          </span>
          {originalPrice && (
            <span className="text-sm text-neutral-400 line-through">
              {formatPrice(originalPrice)}
            </span>
          )}
        </div>
      </div>
    </motion.article>
  );
}

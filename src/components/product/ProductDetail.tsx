"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Heart, Minus, Plus, Star, Truck, Shield, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";
import PageTransition from "@/components/ui/PageTransition";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { formatPrice, cn, FREE_SHIPPING_MIN } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useCatalog } from "@/context/CatalogContext";
import SafeImage from "@/components/ui/SafeImage";
import {
  getProductDisplayImages,
  getVariantDisplayImages,
} from "@/lib/image-utils";
import {
  findVariant,
  getProductVariantsSafe,
  getUniqueColors,
  getUniqueScents,
  getUniqueSizes,
  getVariantDisplayPrice,
  hasProductVariants,
  isVariantInStock,
  resolveProductVariantForAdd,
} from "@/lib/variants";
import { Product } from "@/types";

interface ProductDetailProps {
  slug: string;
  initialProduct?: Product;
}

export default function ProductDetail({ slug, initialProduct }: ProductDetailProps) {
  const { getProductBySlug, ready } = useCatalog();
  const product = getProductBySlug(slug) ?? initialProduct;
  const { addItem } = useCart();
  const { isInWishlist, toggleItem } = useWishlist();

  const variants = useMemo(
    () => (product ? getProductVariantsSafe(product) : []),
    [product]
  );
  const usesVariants = product ? hasProductVariants(product) : false;

  const colors = useMemo(() => {
    if (!product) return [];
    if (usesVariants) {
      const unique = getUniqueColors(variants);
      return unique.length > 0 ? unique : ["Default"];
    }
    return product.colors ?? [];
  }, [product, usesVariants, variants]);

  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedScent, setSelectedScent] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const showColors = colors.length > 1;
  const activeColor = selectedColor || colors[0] || "Default";
  const colorFilter = showColors ? activeColor : undefined;

  const scentsForSelection = useMemo(() => {
    if (!product || !usesVariants) return [];
    return getUniqueScents(variants, colorFilter);
  }, [product, usesVariants, variants, colorFilter]);

  const activeScent = useMemo(() => {
    if (selectedScent && scentsForSelection.includes(selectedScent)) {
      return selectedScent;
    }
    return scentsForSelection[0] ?? "";
  }, [selectedScent, scentsForSelection]);

  const sizesForSelection = useMemo(() => {
    if (!product) return [];
    if (!usesVariants) return product.sizes ?? [];
    if (scentsForSelection.length > 0) {
      return getUniqueSizes(variants, colorFilter, activeScent);
    }
    return getUniqueSizes(variants, colorFilter);
  }, [
    product,
    usesVariants,
    variants,
    colorFilter,
    scentsForSelection.length,
    activeScent,
  ]);

  const activeSize = useMemo(() => {
    if (selectedSize && sizesForSelection.includes(selectedSize)) {
      return selectedSize;
    }
    return sizesForSelection[0] || "";
  }, [selectedSize, sizesForSelection]);

  const effectiveColor = showColors ? activeColor : variants[0]?.color ?? "Default";

  const activeVariant = useMemo(() => {
    if (!usesVariants || !product || !activeSize) {
      return undefined;
    }
    return findVariant(
      variants,
      effectiveColor,
      activeSize,
      scentsForSelection.length > 0 ? activeScent : ""
    );
  }, [
    usesVariants,
    product,
    variants,
    effectiveColor,
    activeSize,
    activeScent,
    scentsForSelection.length,
  ]);

  const displayImages = useMemo(() => {
    if (!product) return [];
    if (usesVariants && activeVariant) {
      return getVariantDisplayImages(activeVariant, product);
    }
    return getProductDisplayImages(product);
  }, [product, usesVariants, activeVariant]);

  const { price, originalPrice } = useMemo(() => {
    if (!product) return { price: 0, originalPrice: undefined };
    return getVariantDisplayPrice(activeVariant ?? null, {
      price: product.price,
      originalPrice: product.originalPrice,
    });
  }, [product, activeVariant]);

  const variantInStock = usesVariants
    ? activeVariant
      ? isVariantInStock(activeVariant)
      : false
    : (product?.inStock ?? false);

  const maxQuantity = usesVariants
    ? activeVariant?.stock ?? 0
    : product?.inStock
      ? 99
      : 0;

  useEffect(() => {
    setSelectedImage(0);
  }, [activeColor, activeSize, activeScent]);

  useEffect(() => {
    if (product && colors.length && !selectedColor) {
      setSelectedColor(colors[0]);
    }
  }, [product, colors, selectedColor]);

  if (!ready && !initialProduct) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-neutral-400">
        Loading...
      </div>
    );
  }

  if (!product) notFound();

  const showScents = usesVariants && scentsForSelection.length > 0;
  const showSizes =
    usesVariants ? sizesForSelection.length > 0 : (product.sizes?.length ?? 0) > 0;
  const inWishlist = isInWishlist(product.id);
  const canAddToCart = usesVariants ? !!activeVariant && variantInStock : variantInStock;

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    setSelectedSize("");
    setSelectedScent("");
  };

  const handleScentChange = (scent: string) => {
    setSelectedScent(scent);
    setSelectedSize("");
  };

  const handleSizeChange = (size: string) => {
    setSelectedSize(size);
  };

  const handleAddToCart = () => {
    if (!canAddToCart) return;
    const variant = resolveProductVariantForAdd(product, activeVariant ?? null);
    addItem(product, variant, quantity);
  };

  const isScentAvailable = (scent: string) => {
    if (!usesVariants) return product.inStock;
    return getUniqueSizes(variants, colorFilter, scent).some((size) => {
      const variant = findVariant(variants, effectiveColor, size, scent);
      return variant ? isVariantInStock(variant) : false;
    });
  };

  const isSizeAvailable = (size: string) => {
    if (!usesVariants) return product.inStock;
    const variant = findVariant(
      variants,
      effectiveColor,
      size,
      scentsForSelection.length > 0 ? activeScent : ""
    );
    return variant ? isVariantInStock(variant) : false;
  };

  return (
    <PageTransition>
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
        <nav className="mb-8 text-sm text-neutral-500">
          <Link href="/" className="hover:text-primary">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link href="/shop" className="hover:text-primary">
            Shop
          </Link>
          <span className="mx-2">/</span>
          <span className="text-neutral-900 dark:text-white">{product.name}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="space-y-4">
            <motion.div
              key={`${activeColor}-${activeSize}-${activeScent}-${selectedImage}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative aspect-square overflow-hidden rounded-3xl bg-[#faf8f5] p-6 ring-1 ring-neutral-100 md:p-8 dark:bg-neutral-950 dark:ring-neutral-800"
            >
              {displayImages[selectedImage] ? (
                <div className="relative h-full w-full">
                  <SafeImage
                    src={displayImages[selectedImage]}
                    alt={product.name}
                    fill
                    priority
                    className="object-contain object-center"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
              ) : (
                <div className="flex h-full items-center justify-center text-neutral-400">
                  No image
                </div>
              )}
              <div className="absolute left-4 top-4 flex gap-2">
                {product.isNew && <Badge variant="new">New</Badge>}
                {originalPrice && <Badge variant="sale">Sale</Badge>}
              </div>
            </motion.div>

            {displayImages.length > 1 && (
              <div className="flex gap-3">
                {displayImages.map((img, i) => (
                  <button
                    key={`${activeColor}-${activeSize}-${activeScent}-${i}-${img}`}
                    onClick={() => setSelectedImage(i)}
                    className={cn(
                      "relative h-20 w-20 overflow-hidden rounded-xl bg-[#faf8f5] p-1.5 transition-all dark:bg-neutral-950",
                      selectedImage === i
                        ? "ring-2 ring-primary ring-offset-2"
                        : "opacity-60 hover:opacity-100"
                    )}
                  >
                    <SafeImage
                      src={img}
                      alt=""
                      fill
                      className="object-contain object-center"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-primary">
              {product.brand}
            </p>
            <h1 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-4xl">
              {product.name}
            </h1>

            <div className="mt-3 flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-4 w-4",
                      i < Math.floor(product.rating)
                        ? "fill-primary text-primary"
                        : "text-neutral-300"
                    )}
                  />
                ))}
              </div>
              <span className="text-sm text-neutral-500">
                {product.rating} ({product.reviewCount} reviews)
              </span>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <span className="text-2xl font-bold">{formatPrice(price)}</span>
              {originalPrice && (
                <span className="text-lg text-neutral-400 line-through">
                  {formatPrice(originalPrice)}
                </span>
              )}
            </div>

            {activeVariant?.sku && (
              <p className="mt-2 text-xs text-neutral-500">
                SKU: {activeVariant.sku}
                {(activeVariant.stock ?? 0) > 0 && (
                  <span className="ml-3">{activeVariant.stock} in stock</span>
                )}
              </p>
            )}

            <p className="mt-6 text-base leading-relaxed text-neutral-600 dark:text-neutral-400">
              {product.longDescription}
            </p>

            {showColors && (
              <div className="mt-8">
                <p className="mb-3 text-sm font-medium">
                  Color:{" "}
                  <span className="text-neutral-500">{activeColor}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => handleColorChange(color)}
                      className={cn(
                        "rounded-full border px-4 py-2 text-sm transition-all",
                        activeColor === color
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-neutral-200 hover:border-neutral-400 dark:border-neutral-800"
                      )}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {showScents && (
              <div className="mt-8">
                <p className="mb-3 text-sm font-medium">
                  Select Scent:{" "}
                  <span className="text-neutral-500">{activeScent}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {scentsForSelection.map((scent) => {
                    const available = isScentAvailable(scent);
                    return (
                      <button
                        key={scent}
                        onClick={() => handleScentChange(scent)}
                        disabled={!available}
                        className={cn(
                          "rounded-full border px-4 py-2 text-sm transition-all",
                          activeScent === scent
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-neutral-200 hover:border-neutral-400 dark:border-neutral-800",
                          !available &&
                            "cursor-not-allowed opacity-40 line-through"
                        )}
                      >
                        {scent}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {showSizes && (
              <div className="mt-6">
                <p className="mb-3 text-sm font-medium">
                  Select Size:{" "}
                  <span className="text-neutral-500">{activeSize}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {sizesForSelection.map((size) => {
                    const available = isSizeAvailable(size);
                    return (
                      <button
                        key={size}
                        onClick={() => handleSizeChange(size)}
                        disabled={!available}
                        className={cn(
                          "rounded-full border px-4 py-2 text-sm transition-all",
                          activeSize === size
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-neutral-200 hover:border-neutral-400 dark:border-neutral-800",
                          !available &&
                            "cursor-not-allowed opacity-40 line-through"
                        )}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mt-8 flex items-center gap-4">
              <div className="flex items-center rounded-full border border-neutral-200 dark:border-neutral-800">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="flex h-11 w-11 items-center justify-center hover:text-primary"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-10 text-center font-medium">{quantity}</span>
                <button
                  onClick={() =>
                    setQuantity(Math.min(maxQuantity || quantity + 1, quantity + 1))
                  }
                  disabled={!canAddToCart || quantity >= maxQuantity}
                  className="flex h-11 w-11 items-center justify-center hover:text-primary disabled:opacity-40"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <Button
                onClick={handleAddToCart}
                disabled={!canAddToCart}
                className="flex-1"
                size="lg"
              >
                {variantInStock ? "Add to Cart" : "Sold Out"}
              </Button>

              <button
                onClick={() => toggleItem(product)}
                className={cn(
                  "flex h-14 w-14 items-center justify-center rounded-full border transition-all",
                  inWishlist
                    ? "border-primary bg-primary text-white"
                    : "border-neutral-200 hover:border-primary hover:text-primary dark:border-neutral-800"
                )}
              >
                <Heart className={cn("h-5 w-5", inWishlist && "fill-current")} />
              </button>
            </div>

            <div className="mt-10 space-y-4 border-t border-neutral-200 pt-8 dark:border-neutral-800">
              {[
                { icon: Truck, text: `Complimentary shipping on orders over ${formatPrice(FREE_SHIPPING_MIN)}` },
                { icon: Shield, text: "Authenticity guaranteed" },
                { icon: RotateCcw, text: "30-day hassle-free returns" },
              ].map(({ icon: Icon, text }) => (
                <div
                  key={text}
                  className="flex items-center gap-3 text-sm text-neutral-500"
                >
                  <Icon className="h-4 w-4 shrink-0 text-primary" />
                  {text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

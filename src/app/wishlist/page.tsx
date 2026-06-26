"use client";

import Link from "next/link";
import { Heart, ArrowRight } from "lucide-react";
import PageTransition from "@/components/ui/PageTransition";
import ProductCard from "@/components/product/ProductCard";
import Button from "@/components/ui/Button";
import { useWishlist } from "@/context/WishlistContext";

export default function WishlistPage() {
  const { items } = useWishlist();

  if (items.length === 0) {
    return (
      <PageTransition>
        <div className="mx-auto flex min-h-[60vh] max-w-7xl flex-col items-center justify-center px-4 py-16 md:px-6">
          <Heart className="mb-6 h-16 w-16 text-neutral-300" />
          <h1 className="font-display text-2xl font-bold">Your wishlist is empty</h1>
          <p className="mt-2 text-neutral-500">
            Save your favorite pieces for later.
          </p>
          <Link href="/shop" className="mt-8">
            <Button size="lg" className="gap-2">
              Explore Collection
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
        <div className="mb-10">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.3em] text-primary">
            Saved
          </p>
          <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
            Wishlist
          </h1>
          <p className="mt-3 text-neutral-500">
            {items.length} {items.length === 1 ? "item" : "items"}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
          {items.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </div>
    </PageTransition>
  );
}

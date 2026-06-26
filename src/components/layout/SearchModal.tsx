"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import SafeImage from "@/components/ui/SafeImage";
import { getProductPrimaryImage } from "@/lib/image-utils";
import { useCatalog } from "@/context/CatalogContext";
import { formatPrice } from "@/lib/utils";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { searchProducts, ready } = useCatalog();
  const results =
    ready && query.length > 1 ? searchProducts(query).slice(0, 5) : [];

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setQuery("");
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-x-4 top-4 z-50 mx-auto max-w-2xl rounded-2xl bg-white shadow-2xl dark:bg-neutral-950 md:inset-x-auto md:top-20"
          >
            <form onSubmit={handleSubmit} className="flex items-center gap-3 border-b border-neutral-200 px-5 py-4 dark:border-neutral-800">
              <Search className="h-5 w-5 text-neutral-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products..."
                className="flex-1 bg-transparent text-base text-neutral-900 placeholder:text-neutral-400 focus:outline-none dark:text-white"
              />
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-1 hover:bg-neutral-100 dark:hover:bg-neutral-900"
              >
                <X className="h-5 w-5" />
              </button>
            </form>

            {results.length > 0 && (
              <div className="max-h-80 overflow-y-auto p-2">
                {results.map((product) => (
                  <Link
                    key={product.id}
                    href={`/product/${product.slug}`}
                    onClick={onClose}
                    className="flex items-center gap-4 rounded-xl p-3 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900"
                  >
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg">
                      <SafeImage
                        src={getProductPrimaryImage(product)}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium">{product.name}</p>
                      <p className="text-xs text-neutral-500">{product.category}</p>
                    </div>
                    <span className="text-sm font-semibold">{formatPrice(product.price)}</span>
                  </Link>
                ))}
                <button
                  onClick={handleSubmit}
                  className="w-full rounded-xl py-3 text-center text-sm text-primary hover:bg-primary/5"
                >
                  View all results for &ldquo;{query}&rdquo;
                </button>
              </div>
            )}

            {query.length > 1 && results.length === 0 && (
              <div className="p-8 text-center text-sm text-neutral-500">
                No products found for &ldquo;{query}&rdquo;
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

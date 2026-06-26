import Link from "next/link";
import { brands } from "@/lib/brands";

export default function BrandStrip() {
  return (
    <section
      id="brands"
      aria-label="Premium brands"
      className="border-y border-neutral-200 bg-neutral-50 py-10 dark:border-neutral-800 dark:bg-neutral-900/40 md:py-12"
    >
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <ul className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-4 lg:grid-cols-8">
          {brands.map((brand) => (
            <li key={brand.id} className="text-center">
              <Link
                href={`/shop?brand=${brand.slug}`}
                className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-900 transition-colors hover:text-primary dark:text-white md:text-xs"
              >
                {brand.displayName}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

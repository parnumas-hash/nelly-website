import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

import { BRAND_LOGO_SRC } from "@/lib/brand-assets";

export const LOGO_SRC = BRAND_LOGO_SRC;

const sizeClasses = {
  sm: "h-12",
  md: "h-14 md:h-16",
  lg: "h-20 md:h-24",
  xl: "h-28 md:h-32",
  "2xl": "h-36 md:h-44",
} as const;

interface LogoProps {
  href?: string;
  asLink?: boolean;
  size?: keyof typeof sizeClasses;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  /** Subtle card behind logo — helps on dark/photo backgrounds */
  framed?: boolean;
}

export default function Logo({
  href = "/",
  asLink = true,
  size = "md",
  className,
  imageClassName,
  priority = false,
  framed = false,
}: LogoProps) {
  const image = (
    <Image
      src={LOGO_SRC}
      alt="NELLY GROUP CO., LTD."
      width={480}
      height={240}
      priority={priority}
      className={cn("w-auto object-contain", sizeClasses[size], imageClassName)}
    />
  );

  const body = framed ? (
    <span className="inline-flex rounded-xl bg-white px-3 py-1.5 shadow-md ring-1 ring-black/5">
      {image}
    </span>
  ) : (
    image
  );

  if (!asLink) {
    return (
      <span className={cn("inline-flex shrink-0 items-center", className)}>
        {body}
      </span>
    );
  }

  if (!href) {
    return (
      <span className={cn("inline-flex shrink-0 items-center", className)}>
        {body}
      </span>
    );
  }

  return (
    <Link
      href={href}
      className={cn("inline-flex shrink-0 items-center transition-opacity hover:opacity-90", className)}
      aria-label="NELLY GROUP home"
    >
      {body}
    </Link>
  );
}

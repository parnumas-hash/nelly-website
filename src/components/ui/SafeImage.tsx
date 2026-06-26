"use client";

import { useEffect, useState } from "react";
import Image, { type ImageProps } from "next/image";
import {
  PLACEHOLDER_IMAGE,
  sanitizeImageUrl,
  shouldUnoptimize,
} from "@/lib/image-utils";

type SafeImageProps = Omit<ImageProps, "src"> & {
  src?: string | null;
  fallback?: string;
};

export default function SafeImage({
  src,
  fallback = PLACEHOLDER_IMAGE,
  alt,
  unoptimized,
  onError,
  ...props
}: SafeImageProps) {
  const resolvedSrc = sanitizeImageUrl(src, fallback);
  const [currentSrc, setCurrentSrc] = useState(resolvedSrc);

  useEffect(() => {
    setCurrentSrc(resolvedSrc);
  }, [resolvedSrc]);

  return (
    <Image
      {...props}
      src={currentSrc}
      alt={alt ?? ""}
      unoptimized={unoptimized ?? shouldUnoptimize(currentSrc)}
      onError={(event) => {
        if (currentSrc !== fallback) {
          setCurrentSrc(fallback);
        }
        onError?.(event);
      }}
    />
  );
}

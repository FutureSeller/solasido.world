"use client";

import { toCloudflareImageUrl } from "@/lib/cloudflare-image";
import { useState } from "react";

interface MarkdownImageProps {
  src: string;
  alt?: string;
  width?: string | number;
  height?: string | number;
}

export default function MarkdownImage({
  src,
  alt,
  width,
  height,
}: MarkdownImageProps) {
  const [loaded, setLoaded] = useState(false);
  const optimizedSrc = toCloudflareImageUrl(src, { quality: 75 });

  const parsedWidth =
    typeof width === "number" ? width : Number.parseInt(String(width), 10);
  const parsedHeight =
    typeof height === "number" ? height : Number.parseInt(String(height), 10);
  const hasValidRatio =
    Number.isFinite(parsedWidth) &&
    Number.isFinite(parsedHeight) &&
    parsedWidth > 0 &&
    parsedHeight > 0;
  const aspectRatio = hasValidRatio
    ? `${parsedWidth} / ${parsedHeight}`
    : undefined;

  return (
    <span
      className={`block relative w-full my-8 rounded-lg overflow-hidden ${loaded ? "" : "bg-gray-100 min-h-40"}`}
      style={!loaded && aspectRatio ? { aspectRatio } : undefined}
    >
      {!loaded && <span className="absolute inset-0 bg-gray-100" />}
      <img
        src={optimizedSrc}
        alt={alt || ""}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
        className={`block w-full h-auto ${loaded ? "opacity-100" : "opacity-0"}`}
      />
    </span>
  );
}

"use client";

import { toCloudflareImageUrl } from "@/lib/cloudflare-image";
import { useEffect, useState } from "react";

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
  const [status, setStatus] = useState<"loading" | "loaded" | "error">(
    "loading",
  );
  const [isOpen, setIsOpen] = useState(false);
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
  const isLoading = status === "loading";
  const isError = status === "error";

  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      <span
        className={`block relative w-full my-8 rounded-lg overflow-hidden ${
          isLoading || isError ? "bg-gray-100 min-h-40" : ""
        }`}
        style={isLoading && aspectRatio ? { aspectRatio } : undefined}
      >
        {isLoading && <span className="absolute inset-0 bg-gray-100" />}
        {isError && (
          <span className="absolute inset-0 flex items-center justify-center text-sm text-gray-500">
            Image unavailable
          </span>
        )}
        <button
          type="button"
          aria-label="Open image preview"
          onClick={() => {
            if (status === "loaded") setIsOpen(true);
          }}
          disabled={status !== "loaded"}
          className="block w-full text-left disabled:cursor-default"
        >
          <img
            src={optimizedSrc}
            alt={alt || ""}
            loading="lazy"
            decoding="async"
            onLoad={() => setStatus("loaded")}
            onError={() => setStatus("error")}
            className={`block w-full h-auto ${
              status === "loaded" ? "opacity-100 cursor-zoom-in" : "opacity-0"
            }`}
          />
        </button>
      </span>

      {isOpen && (
        <button
          type="button"
          aria-label="Close image preview"
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4"
        >
          <img
            src={optimizedSrc}
            alt={alt || ""}
            className="max-h-[92vh] w-auto max-w-full rounded-md"
          />
        </button>
      )}
    </>
  );
}

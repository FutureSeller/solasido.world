import Link from "next/link";
import type { ReactNode } from "react";
import type { Components } from "react-markdown";
import MarkdownImage from "./MarkdownImage";

const EMBED_ALLOW =
  "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";

export function stripLeadingMetaCodeBlock(markdown: string): string {
  return markdown.replace(
    /^\s*(?:```|~~~)[^\n]*\n[\s\S]*?\n(?:```|~~~)\s*\n?/,
    "",
  );
}

function getYouTubeEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();

    if (host === "youtu.be") {
      const id = parsed.pathname.split("/").filter(Boolean)[0];
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }

    if (host.includes("youtube.com")) {
      if (parsed.pathname === "/watch") {
        const id = parsed.searchParams.get("v");
        return id ? `https://www.youtube.com/embed/${id}` : null;
      }

      if (parsed.pathname.startsWith("/shorts/")) {
        const id = parsed.pathname.split("/").filter(Boolean)[1];
        return id ? `https://www.youtube.com/embed/${id}` : null;
      }

      if (parsed.pathname.startsWith("/embed/")) {
        const id = parsed.pathname.split("/").filter(Boolean)[1];
        return id ? `https://www.youtube.com/embed/${id}` : null;
      }
    }

    return null;
  } catch {
    return null;
  }
}

function renderMediaFrame(child: ReactNode) {
  return (
    <div className="my-8">
      <div
        className="relative w-full overflow-hidden rounded-lg bg-black"
        style={{ aspectRatio: "16 / 9" }}
      >
        {child}
      </div>
    </div>
  );
}

function isNodeElement(node: unknown): node is {
  type: "element";
  tagName: string;
  properties?: Record<string, unknown>;
} {
  return (
    typeof node === "object" &&
    node !== null &&
    "type" in node &&
    node.type === "element" &&
    "tagName" in node &&
    typeof node.tagName === "string"
  );
}

function getFirstChild(node: unknown): unknown {
  if (typeof node !== "object" || node === null || !("children" in node)) {
    return null;
  }

  if (!Array.isArray(node.children) || node.children.length !== 1) {
    return null;
  }

  return node.children[0];
}

function isImageOnlyParagraph(node: unknown): boolean {
  const firstChild = getFirstChild(node);
  if (!firstChild || !isNodeElement(firstChild)) return false;
  return firstChild.tagName === "img";
}

function getYoutubeHrefFromParagraph(node: unknown): string | null {
  const firstChild = getFirstChild(node);
  if (!firstChild || !isNodeElement(firstChild)) return null;
  if (firstChild.tagName !== "a") return null;

  const href = firstChild.properties?.href;
  return typeof href === "string" ? href : null;
}

export const markdownComponents: Components = {
  img: ({ src, alt, width, height }) => {
    if (typeof src !== "string") return null;
    return <MarkdownImage src={src} alt={alt} width={width} height={height} />;
  },
  a: ({ href, children }) => {
    const normalizedHref = typeof href === "string" ? href : null;
    if (!normalizedHref) return <span>{children}</span>;

    const isInternal =
      normalizedHref.startsWith("/") ||
      normalizedHref.startsWith("#") ||
      normalizedHref.startsWith("?");

    if (isInternal) {
      return (
        <Link href={normalizedHref} className="underline underline-offset-4">
          {children}
        </Link>
      );
    }

    return (
      <a
        href={normalizedHref}
        target="_blank"
        rel="noreferrer noopener"
        className="underline underline-offset-4"
      >
        {children}
      </a>
    );
  },
  table: ({ children }) => {
    return (
      <div className="my-6 overflow-x-auto">
        <table>{children}</table>
      </div>
    );
  },
  iframe: ({ children, ...props }) => {
    return renderMediaFrame(
      <iframe {...props} className="absolute inset-0 h-full w-full">
        {children}
      </iframe>,
    );
  },
  video: ({ children, ...props }) => {
    return renderMediaFrame(
      <video {...props} className="absolute inset-0 h-full w-full">
        {children}
      </video>,
    );
  },
  p: ({ node, children }) => {
    if (isImageOnlyParagraph(node)) return <>{children}</>;

    const youtubeHref = getYoutubeHrefFromParagraph(node);
    if (youtubeHref) {
      const embedUrl = getYouTubeEmbedUrl(youtubeHref);
      if (embedUrl) {
        return renderMediaFrame(
          <iframe
            src={embedUrl}
            title="YouTube video"
            allow={EMBED_ALLOW}
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />,
        );
      }
    }

    return <p>{children}</p>;
  },
};

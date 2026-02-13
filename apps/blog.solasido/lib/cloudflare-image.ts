interface CloudflareImageOptions {
  width?: number;
  quality?: number;
}

export function toCloudflareImageUrl(
  src: string,
  options: CloudflareImageOptions = {},
): string {
  if (process.env.NODE_ENV !== "production") return src;

  const trimmed = src.trim();
  if (!trimmed) return src;
  if (trimmed.startsWith("/cdn-cgi/image/")) return trimmed;
  if (trimmed.startsWith("data:") || trimmed.startsWith("blob:"))
    return trimmed;
  if (!/^https?:\/\//i.test(trimmed)) return trimmed;

  const transforms = ["format=auto", `quality=${options.quality ?? 75}`];
  if (options.width && options.width > 0) {
    transforms.push(`width=${Math.floor(options.width)}`);
  }

  return `/cdn-cgi/image/${transforms.join(",")}/${encodeURIComponent(trimmed)}`;
}

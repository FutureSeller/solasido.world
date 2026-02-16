/**
 * Resize image URL using Cloudflare Image Resizing
 */
export function resizeImageUrl(
  url: string,
  width: number,
  height: number,
  options: {
    fit?: 'scale-down' | 'contain' | 'cover' | 'crop' | 'pad'
    quality?: number
    format?: 'auto' | 'webp' | 'avif' | 'json'
  } = {}
): string {
  const { fit = 'cover', quality = 85, format = 'auto' } = options

  const urlObj = new URL(url)
  const path = urlObj.pathname

  return `${urlObj.origin}/cdn-cgi/image/width=${width},height=${height},fit=${fit},quality=${quality},format=${format}${path}`
}

/**
 * Format ISO date string for Korean locale.
 */
export function formatKoreanDate(date: string): string {
  return new Date(date).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Safely extract hostname from URL-like string.
 */
export function getHostname(url: string): string {
  try {
    return new URL(url).hostname
  } catch (_) {
    return ''
  }
}

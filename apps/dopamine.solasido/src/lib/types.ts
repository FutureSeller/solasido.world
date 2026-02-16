// Database types
export interface RawData {
  instagram_id: string
  caption: string | null
  permalink: string | null
  timestamp: string
  carousel_count: number
}

export interface Asset {
  id: number
  instagram_media_id: string
  slide_index: number
  sha256_hash: string
  r2_key: string
  r2_url: string
  width: number | null
  height: number | null
  size_bytes: number | null
}

export interface BlogPost {
  id: number
  instagram_id: string | null
  slug: string | null
  title: string | null
  meta_description: string | null
  body: string | null
  summary: string | null
  status: 'draft' | 'review' | 'published'
  created_at: string
  published_at: string | null
  canonical_url: string | null
  og_image_url: string | null
}

// Instagram Graph API types
export interface InstagramMediaChild {
  id: string
  media_url: string
}

export interface InstagramMedia {
  id: string
  caption?: string
  permalink: string
  timestamp: string
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM'
  children?: {
    data: InstagramMediaChild[]
  }
}

export interface InstagramMediaResponse {
  data: InstagramMedia[]
  paging?: {
    cursors: {
      before: string
      after: string
    }
    next?: string
  }
}

// Draft generation types
export interface DraftContent {
  title: string
  meta_description: string
  body: string
  summary: string
}

// Cloudflare bindings
export interface Env {
  DB: D1Database
  IMAGES_BUCKET: R2Bucket
  NEXT_CACHE_WORKERS_R2: R2Bucket
  NEXT_CACHE_WORKERS_KV: KVNamespace
  NEXT_CACHE_WORKERS_QUEUE: Queue
  INSTAGRAM_ACCESS_TOKEN: string
  REVALIDATE_SECRET: string
  CACHE_PURGE_API_TOKEN: string
  CACHE_PURGE_ZONE_ID: string
}

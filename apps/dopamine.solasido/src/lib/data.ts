/**
 * Data layer - abstracts data fetching
 *
 * Build-time SSG mode: Fetches data from D1 via Wrangler CLI
 * Development fallback: Uses mock data from src/data/mock-posts.ts
 */

import { spawnSync } from 'node:child_process'
import { mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { getPublishedPosts, getPostBySlug, getAssetsForPost } from '../data/mock-posts'
import type { BlogPostModel, BlogPostWithAssets, PostAsset } from './types'

const USE_MOCK_DATA = import.meta.env.PUBLIC_USE_MOCK_DATA === 'true'
const D1_DATABASE_NAME = import.meta.env.D1_DATABASE_NAME || 'dopamine_db'
const D1_REMOTE = import.meta.env.D1_REMOTE !== 'false'
let cachedPublishedPosts: BlogPostWithAssets[] | null = null

function mapAssetsForPost(instagramId: string): PostAsset[] {
  return getAssetsForPost(instagramId).map((asset) => ({
    id: asset.id,
    r2Url: asset.r2Url,
    slideIndex: asset.slideIndex,
    width: asset.width,
    height: asset.height,
  }))
}

function attachAssets(post: BlogPostModel): BlogPostWithAssets {
  return {
    ...post,
    assets: mapAssetsForPost(post.instagramId),
  }
}

type D1Result<T> = {
  success: boolean
  results?: T[]
  error?: string
}

type D1PostRow = {
  id: number
  instagram_id: string
  slug: string
  title: string
  meta_description: string
  body: string
  summary: string
  status: 'draft' | 'review' | 'published'
  created_at: string
  published_at: string
  canonical_url: string
  og_image_url: string | null
}

type D1AssetRow = {
  instagram_media_id: string
  id: number
  r2_url: string
  slide_index: number
  width: number | null
  height: number | null
}

function runD1Query<T>(sql: string): T[] {
  const logDir = resolve(process.cwd(), '.wrangler', 'logs')
  mkdirSync(logDir, { recursive: true })
  const logPath = resolve(logDir, `build-data-${Date.now()}.log`)

  const result = spawnSync(
    'pnpm',
    [
      'exec',
      'wrangler',
      'd1',
      'execute',
      D1_DATABASE_NAME,
      D1_REMOTE ? '--remote' : '--local',
      '--command',
      sql,
      '--json',
    ],
    {
      encoding: 'utf8',
      env: {
        ...process.env,
        WRANGLER_LOG_PATH: logPath,
      },
    }
  )

  if (result.status !== 0) {
    const detail = result.stderr || result.stdout || `D1 query failed with exit code ${result.status}`
    throw new Error(`Failed to fetch D1 data for SSG.\n${detail}`)
  }

  const parsed = JSON.parse(result.stdout) as D1Result<T>[]
  if (!Array.isArray(parsed) || parsed.length === 0) {
    return []
  }
  return parsed[0].results ?? []
}

async function loadPublishedPostsFromD1(): Promise<BlogPostWithAssets[]> {
  const posts = runD1Query<D1PostRow>(`
    SELECT
      id,
      instagram_id,
      slug,
      title,
      meta_description,
      body,
      summary,
      status,
      created_at,
      published_at,
      canonical_url,
      og_image_url
    FROM blog_posts
    WHERE status = 'published'
      AND slug IS NOT NULL
      AND title IS NOT NULL
      AND meta_description IS NOT NULL
      AND body IS NOT NULL
      AND summary IS NOT NULL
      AND published_at IS NOT NULL
      AND canonical_url IS NOT NULL
    ORDER BY published_at DESC
  `)

  const assets = runD1Query<D1AssetRow>(`
    SELECT
      a.instagram_media_id,
      a.id,
      a.r2_url,
      a.slide_index,
      a.width,
      a.height
    FROM assets a
    JOIN blog_posts p ON p.instagram_id = a.instagram_media_id
    WHERE p.status = 'published'
    ORDER BY a.instagram_media_id ASC, a.slide_index ASC
  `)

  const assetMap = new Map<string, PostAsset[]>()
  for (const row of assets) {
    const current = assetMap.get(row.instagram_media_id) ?? []
    current.push({
      id: row.id,
      r2Url: row.r2_url,
      slideIndex: row.slide_index,
      width: row.width ?? 1200,
      height: row.height ?? 630,
    })
    assetMap.set(row.instagram_media_id, current)
  }

  return posts.map((row) => ({
    id: row.id,
    instagramId: row.instagram_id,
    slug: row.slug,
    title: row.title,
    metaDescription: row.meta_description,
    body: row.body,
    summary: row.summary,
    status: row.status,
    createdAt: row.created_at,
    publishedAt: row.published_at,
    canonicalUrl: row.canonical_url,
    ogImageUrl: row.og_image_url,
    assets: assetMap.get(row.instagram_id) ?? [],
  }))
}

export async function fetchPublishedPosts(): Promise<BlogPostWithAssets[]> {
  if (cachedPublishedPosts) {
    return cachedPublishedPosts
  }

  if (USE_MOCK_DATA) {
    const posts = getPublishedPosts()
    cachedPublishedPosts = posts.map(attachAssets)
    return cachedPublishedPosts
  }

  cachedPublishedPosts = await loadPublishedPostsFromD1()
  return cachedPublishedPosts
}

export async function fetchPostBySlug(slug: string): Promise<BlogPostWithAssets | null> {
  if (USE_MOCK_DATA) {
    const post = getPostBySlug(slug)
    if (!post) return null

    return attachAssets(post)
  }

  const posts = await fetchPublishedPosts()
  const post = posts.find((item) => item.slug === slug)
  return post ?? null
}

export function getDataMode(): 'mock' | 'd1' {
  if (USE_MOCK_DATA) {
    return 'mock'
  }

  return 'd1'
}

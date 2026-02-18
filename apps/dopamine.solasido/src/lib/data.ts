/**
 * Data layer - abstracts data fetching
 *
 * Build-time SSG mode: Fetches data from D1 via Wrangler CLI
 */

import type { BlogPostWithAssets } from './types'

let cachedPublishedPosts: BlogPostWithAssets[] | null = null

export async function fetchPublishedPosts(): Promise<BlogPostWithAssets[]> {
  if (cachedPublishedPosts) {
    return cachedPublishedPosts
  }

  const { fetchPublishedPostsFromD1 } = await import('./d1-build-data')
  cachedPublishedPosts = fetchPublishedPostsFromD1()
  return cachedPublishedPosts
}

export async function fetchPostBySlug(slug: string): Promise<BlogPostWithAssets | null> {
  const posts = await fetchPublishedPosts()
  const post = posts.find((item) => item.slug === slug)
  return post ?? null
}

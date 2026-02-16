/**
 * Data layer - abstracts data fetching
 *
 * Development: Uses mock data from src/data/mock-posts.ts
 * Production: Will query D1 database
 */

import { getPublishedPosts, getPostBySlug, getAssetsForPost } from '../data/mock-posts'
import type { BlogPostModel, BlogPostWithAssets, PostAsset } from './types'

const USE_MOCK_DATA = import.meta.env.PUBLIC_USE_MOCK_DATA !== 'false'

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

export async function fetchPublishedPosts(): Promise<BlogPostWithAssets[]> {
  if (USE_MOCK_DATA) {
    const posts = getPublishedPosts()
    return posts.map(attachAssets)
  }

  // TODO: Implement D1 query
  // const env = getRuntime().env
  // const db = createDatabaseClient(env.DB)
  // const posts = await db.listPublishedPosts()
  // return posts

  throw new Error('D1 not implemented yet')
}

export async function fetchPostBySlug(slug: string): Promise<BlogPostWithAssets | null> {
  if (USE_MOCK_DATA) {
    const post = getPostBySlug(slug)
    if (!post) return null

    return attachAssets(post)
  }

  // TODO: Implement D1 query
  // const env = getRuntime().env
  // const db = createDatabaseClient(env.DB)
  // const post = await db.getBlogPostBySlug(slug)
  // return post

  throw new Error('D1 not implemented yet')
}

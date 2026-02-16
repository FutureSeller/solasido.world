import type { Asset, BlogPost, RawData } from './types'

type UpdatableBlogPostFields = Omit<BlogPost, 'id' | 'created_at'>
const BLOG_POST_UPDATE_COLUMNS: Array<keyof UpdatableBlogPostFields> = [
  'instagram_id',
  'slug',
  'title',
  'meta_description',
  'body',
  'summary',
  'status',
  'published_at',
  'canonical_url',
  'og_image_url',
]

export class DatabaseClient {
  constructor(private db: D1Database) {}

  // RawData (Instagram source) operations
  async getRawData(instagramId: string): Promise<RawData | null> {
    const result = await this.db
      .prepare('SELECT * FROM rawdata WHERE instagram_id = ?')
      .bind(instagramId)
      .first<RawData>()
    return result
  }

  async insertRawData(data: RawData): Promise<void> {
    await this.db
      .prepare(
        `INSERT INTO rawdata (instagram_id, caption, permalink, timestamp, carousel_count)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(instagram_id) DO UPDATE SET
           caption = excluded.caption,
           permalink = excluded.permalink,
           timestamp = excluded.timestamp,
           carousel_count = excluded.carousel_count`
      )
      .bind(
        data.instagram_id,
        data.caption,
        data.permalink,
        data.timestamp,
        data.carousel_count
      )
      .run()
  }

  async listRawDataWithoutDrafts(): Promise<RawData[]> {
    const result = await this.db
      .prepare(
        `SELECT r.* FROM rawdata r
         LEFT JOIN blog_posts p ON r.instagram_id = p.instagram_id
         WHERE p.id IS NULL
         ORDER BY r.timestamp DESC`
      )
      .all<RawData>()
    return result.results
  }

  // Assets operations
  async getAsset(sha256Hash: string): Promise<Asset | null> {
    const result = await this.db
      .prepare('SELECT * FROM assets WHERE sha256_hash = ?')
      .bind(sha256Hash)
      .first<Asset>()
    return result
  }

  async insertAsset(
    asset: Omit<Asset, 'id'>
  ): Promise<{ id: number } | null> {
    const result = await this.db
      .prepare(
        `INSERT INTO assets (instagram_media_id, slide_index, sha256_hash, r2_key, r2_url, width, height, size_bytes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(sha256_hash) DO NOTHING
         RETURNING id`
      )
      .bind(
        asset.instagram_media_id,
        asset.slide_index,
        asset.sha256_hash,
        asset.r2_key,
        asset.r2_url,
        asset.width,
        asset.height,
        asset.size_bytes
      )
      .first<{ id: number }>()
    return result
  }

  async getAssetsByInstagramId(instagramId: string): Promise<Asset[]> {
    const result = await this.db
      .prepare(
        'SELECT * FROM assets WHERE instagram_media_id = ? ORDER BY slide_index ASC'
      )
      .bind(instagramId)
      .all<Asset>()
    return result.results
  }

  // BlogPost operations
  async getBlogPost(id: number): Promise<BlogPost | null> {
    const result = await this.db
      .prepare('SELECT * FROM blog_posts WHERE id = ?')
      .bind(id)
      .first<BlogPost>()
    return result
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
    const result = await this.db
      .prepare('SELECT * FROM blog_posts WHERE slug = ?')
      .bind(slug)
      .first<BlogPost>()
    return result
  }

  async listPublishedPosts(limit = 50): Promise<BlogPost[]> {
    const result = await this.db
      .prepare(
        'SELECT * FROM blog_posts WHERE status = ? ORDER BY published_at DESC LIMIT ?'
      )
      .bind('published', limit)
      .all<BlogPost>()
    return result.results
  }

  async listDraftsByStatus(
    status: 'draft' | 'review' | 'published'
  ): Promise<BlogPost[]> {
    const result = await this.db
      .prepare('SELECT * FROM blog_posts WHERE status = ? ORDER BY created_at DESC')
      .bind(status)
      .all<BlogPost>()
    return result.results
  }

  async insertBlogPost(
    post: Omit<BlogPost, 'id' | 'created_at'>
  ): Promise<{ id: number }> {
    const now = new Date().toISOString()
    const result = await this.db
      .prepare(
        `INSERT INTO blog_posts (instagram_id, slug, title, meta_description, body, summary, status, created_at, published_at, canonical_url, og_image_url)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         RETURNING id`
      )
      .bind(
        post.instagram_id,
        post.slug,
        post.title,
        post.meta_description,
        post.body,
        post.summary,
        post.status,
        now,
        post.published_at,
        post.canonical_url,
        post.og_image_url
      )
      .first<{ id: number }>()

    if (!result) {
      throw new Error('Failed to insert blog post')
    }

    return result
  }

  async updateBlogPost(
    id: number,
    updates: Partial<UpdatableBlogPostFields>
  ): Promise<void> {
    const fields: string[] = []
    const values: unknown[] = []

    for (const column of BLOG_POST_UPDATE_COLUMNS) {
      const value = updates[column]
      if (value === undefined) {
        continue
      }

      fields.push(`${column} = ?`)
      values.push(value)
    }

    if (fields.length === 0) {
      return
    }

    values.push(id)

    await this.db
      .prepare(`UPDATE blog_posts SET ${fields.join(', ')} WHERE id = ?`)
      .bind(...values)
      .run()
  }

  async publishBlogPost(id: number): Promise<void> {
    const now = new Date().toISOString()
    await this.db
      .prepare(
        'UPDATE blog_posts SET status = ?, published_at = ? WHERE id = ?'
      )
      .bind('published', now, id)
      .run()
  }
}

// Helper function to create database client
export function createDatabaseClient(db: D1Database): DatabaseClient {
  return new DatabaseClient(db)
}

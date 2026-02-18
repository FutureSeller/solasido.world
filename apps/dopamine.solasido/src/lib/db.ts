import type { Asset, BlogPost } from './types'

export class DatabaseClient {
  constructor(private db: D1Database) {}

  // Read-only blog queries used by this app
  async getAssetsByInstagramId(instagramId: string): Promise<Asset[]> {
    const result = await this.db
      .prepare(
        'SELECT * FROM assets WHERE instagram_media_id = ? ORDER BY slide_index ASC'
      )
      .bind(instagramId)
      .all<Asset>()
    return result.results
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
}

// Helper function to create database client
export function createDatabaseClient(db: D1Database): DatabaseClient {
  return new DatabaseClient(db)
}

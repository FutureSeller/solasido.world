import { gunzipSync } from "node:zlib";
import { executeD1Query } from "./d1-client";

export interface Post {
  id: string;
  slug: string;
  title: string;
  content: string;
  created_at: string;
  tags: string[];
  cover_url: string | null;
  // Computed fields for UI
  date: string;
  category: string;
  thumbnail: string | null;
  description: string;
}

interface PostRow {
  id: string;
  slug: string;
  title: string;
  content_base64: string;
  created_at: string;
  tags: string;
  cover_url: string | null;
}

const CATEGORY_MAP: Record<string, string> = {
  lifelog: "lifelog",
  spendinglog: "spendinglog",
  spot: "spot",
  게임: "gamelog",
};

const TRAVEL_KEYWORDS = [
  // Asia
  "일본",
  "도쿄",
  "오사카",
  "후쿠오카",
  "홋카이도",
  "교토",
  "삿포로",
  "쿠마모토",
  "태국",
  "방콕",
  "싱가포르",
  "싱가폴",
  "필리핀",
  "세부",
  // Europe
  "유럽",
  "그리스",
  "스페인",
  "영국",
  "프랑스",
  "이탈리아",
  "아테네",
  "테살로니키",
  "산토리니",
  "메테오라",
  "바르셀로나",
  "마드리드",
  "톨레도",
  "몬세라트",
  "런던",
  "파리",
  "리옹",
  "로마",
  "바티칸",
  "피렌체",
  "포지타노",
  // Americas
  "미국",
  "괌",
  "시애틀",
  "벨뷰",
  "밴쿠버",
  // Korea
  "제주",
  "속초",
  "경주",
  "강릉",
  // Generic travel keywords
  "여행",
  "신혼여행",
];

const POST_SELECT_COLUMNS =
  "id, slug, title, content_base64, created_at, tags, cover_url";

/**
 * Decompress and decode content from D1
 */
function decodeContent(content_base64: string): string {
  const compressed = Buffer.from(content_base64, "base64");
  const decompressed = gunzipSync(compressed);
  return decompressed.toString("utf-8");
}

/**
 * Parse tags from JSON string
 */
function parseTags(tagsJson: string): string[] {
  try {
    const parsed = JSON.parse(tagsJson);
    return Array.isArray(parsed)
      ? parsed.filter((tag): tag is string => typeof tag === "string")
      : [];
  } catch {
    return [];
  }
}

/**
 * Extract description from markdown content
 */
function extractDescription(content: string): string {
  // Remove YAML frontmatter
  let text = content.replace(/^```yaml[\s\S]*?```\n*/m, "");

  // Remove markdown formatting
  text = text
    .replace(/!\[.*?\]\(.*?\)/g, "") // Images
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Links
    .replace(/[*_~`]/g, "") // Bold, italic, strikethrough, code
    .replace(/<\/?u>/g, "") // Underline tags
    .replace(/^#{1,6}\s+/gm, "") // Headers
    .replace(/^\s*[-*+]\s+/gm, "") // Lists
    .trim();

  // Get first meaningful paragraph
  const lines = text.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length > 20) {
      return trimmed.substring(0, 120) + (trimmed.length > 120 ? "..." : "");
    }
  }

  return "";
}

/**
 * Map tag to category
 */
function getCategoryFromTags(tags: string[]): string {
  for (const tag of tags) {
    const category = CATEGORY_MAP[tag.toLowerCase()];
    if (category) return category;
  }

  for (const tag of tags) {
    if (TRAVEL_KEYWORDS.some((keyword) => tag.includes(keyword))) {
      return "travel";
    }
  }

  return "lifelog";
}

/**
 * Format date for display
 */
function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

/**
 * Transform database row to Post object
 */
function transformPost(row: PostRow): Post {
  const tags = parseTags(row.tags);
  const content = decodeContent(row.content_base64);
  const coverUrl = normalizeCoverUrl(row.cover_url);

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    content,
    created_at: row.created_at,
    tags,
    cover_url: coverUrl,
    // Computed fields
    date: formatDate(row.created_at),
    category: getCategoryFromTags(tags),
    thumbnail: coverUrl,
    description: extractDescription(content),
  };
}

function normalizeCoverUrl(coverUrl: string | null): string | null {
  if (!coverUrl || coverUrl === "null") return null;
  return coverUrl;
}

function escapeSqlLiteral(value: string): string {
  return value.replace(/'/g, "''");
}

/**
 * Get all posts from D1
 */
export async function getAllPosts(): Promise<Post[]> {
  const response = await fetch("/api/posts");
  if (!response.ok) {
    throw new Error("Failed to fetch posts");
  }
  const data = await response.json();
  return data.posts;
}

/**
 * Get posts by category/tag
 */
export async function getPostsByCategory(category: string): Promise<Post[]> {
  const response = await fetch(
    `/api/posts?category=${encodeURIComponent(category)}`,
  );
  if (!response.ok) {
    throw new Error("Failed to fetch posts");
  }
  const data = await response.json();
  return data.posts;
}

/**
 * Get a single post by slug
 */
export async function getPostBySlug(slug: string): Promise<Post | null> {
  const response = await fetch(`/api/posts/${encodeURIComponent(slug)}`);
  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error("Failed to fetch post");
  }
  const data = await response.json();
  return data.post;
}

/**
 * Server-side data fetching (for use in Server Components and API routes)
 */

export async function getAllPostsFromD1(): Promise<Post[]> {
  const query = `SELECT ${POST_SELECT_COLUMNS}
                 FROM posts
                 ORDER BY created_at DESC`;

  const rows = await executeD1Query<PostRow>(query);
  return rows.map(transformPost);
}

export async function getPostsByCategoryFromD1(
  category: string,
): Promise<Post[]> {
  const escapedCategory = escapeSqlLiteral(category);
  const query = `SELECT ${POST_SELECT_COLUMNS}
                 FROM posts
                 WHERE tags LIKE '%"${escapedCategory}"%'
                 ORDER BY created_at DESC`;

  const rows = await executeD1Query<PostRow>(query);
  return rows.map(transformPost);
}

export async function getPostBySlugFromD1(slug: string): Promise<Post | null> {
  const escapedSlug = escapeSqlLiteral(slug);
  const query = `SELECT ${POST_SELECT_COLUMNS}
                 FROM posts
                 WHERE slug = '${escapedSlug}'
                 LIMIT 1`;

  const rows = await executeD1Query<PostRow>(query);
  return rows.length > 0 ? transformPost(rows[0]) : null;
}

/**
 * Server-side utility functions for API routes
 */
export const db = {
  transformPost,
  decodeContent,
  parseTags,
};

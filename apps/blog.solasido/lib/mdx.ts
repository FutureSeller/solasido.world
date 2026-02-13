import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const postsDirectory = path.join(process.cwd(), "content/posts");

export interface PostMetadata {
  title: string;
  description: string;
  date: string;
  tags?: string[];
  thumbnail?: string;
  category?: string;
  slug: string;
}

export interface Post extends PostMetadata {
  content: string;
}

// Get all post slugs
export function getAllPostSlugs(): string[] {
  try {
    const files = fs.readdirSync(postsDirectory);
    return files
      .filter((file) => file.endsWith(".md") || file.endsWith(".mdx"))
      .map((file) => file.replace(/\.(md|mdx)$/, ""));
  } catch {
    return [];
  }
}

// Get post by slug
export function getPostBySlug(slug: string): Post | null {
  try {
    const fullPath = path.join(postsDirectory, `${slug}.md`);
    let fileContents: string;

    try {
      fileContents = fs.readFileSync(fullPath, "utf8");
    } catch {
      const mdxPath = path.join(postsDirectory, `${slug}.mdx`);
      fileContents = fs.readFileSync(mdxPath, "utf8");
    }

    const { data, content } = matter(fileContents);

    return {
      slug,
      title: data.title || "",
      description: data.description || "",
      date: typeof data.date === "string" ? data.date : data.date?.toISOString().split("T")[0] || "",
      tags: data.tags || [],
      thumbnail: data.thumbnail,
      category: data.category,
      content,
    };
  } catch {
    return null;
  }
}

// Get all posts sorted by date
export function getAllPosts(): PostMetadata[] {
  const slugs = getAllPostSlugs();
  const posts = slugs
    .map((slug) => {
      const post = getPostBySlug(slug);
      if (!post) return null;
      const { content, ...metadata } = post;
      return metadata;
    })
    .filter((post): post is PostMetadata => post !== null)
    .sort((a, b) => (a.date > b.date ? -1 : 1));

  return posts;
}

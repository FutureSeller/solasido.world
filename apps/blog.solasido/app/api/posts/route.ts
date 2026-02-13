import { NextRequest, NextResponse } from "next/server";
import { executeD1Query } from "@/lib/d1-client";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface PostRow {
  id: string;
  slug: string;
  title: string;
  content_base64: string;
  created_at: string;
  tags: string;
  cover_url: string | null;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category");

    let query: string;

    if (category) {
      // Filter by category (tag)
      query = `SELECT id, slug, title, content_base64, created_at, tags, cover_url
               FROM posts
               WHERE tags LIKE '%"${category}"%'
               ORDER BY created_at DESC`;
    } else {
      // Get all posts
      query = `SELECT id, slug, title, content_base64, created_at, tags, cover_url
               FROM posts
               ORDER BY created_at DESC`;
    }

    const rows = await executeD1Query<PostRow>(query);

    const posts = rows.map((row) => db.transformPost(row));

    return NextResponse.json({ posts });
  } catch (error: any) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts", message: error.message },
      { status: 500 }
    );
  }
}

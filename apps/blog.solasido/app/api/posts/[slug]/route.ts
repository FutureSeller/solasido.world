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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const query = `SELECT id, slug, title, content_base64, created_at, tags, cover_url
                   FROM posts
                   WHERE slug = '${slug.replace(/'/g, "''")}'
                   LIMIT 1`;

    const rows = await executeD1Query<PostRow>(query);

    if (rows.length === 0) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const post = db.transformPost(rows[0]);

    return NextResponse.json({ post });
  } catch (error: any) {
    console.error("Error fetching post:", error);
    return NextResponse.json(
      { error: "Failed to fetch post", message: error.message },
      { status: 500 }
    );
  }
}

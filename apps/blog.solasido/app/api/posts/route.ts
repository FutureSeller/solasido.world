import { getAllPostsFromD1, getPostsByCategoryFromD1 } from "@/lib/db";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category");
    const posts = category
      ? await getPostsByCategoryFromD1(category)
      : await getAllPostsFromD1();

    return NextResponse.json({ posts });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts", message },
      { status: 500 },
    );
  }
}

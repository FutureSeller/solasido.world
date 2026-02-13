"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { PostMetadata } from "@/lib/mdx";

const CATEGORY_CONFIG: Record<string, { emoji: string; label: string }> = {
  all: { emoji: "📚", label: "All" },
  lifelog: { emoji: "🎢", label: "Lifelog" },
  spendinglog: { emoji: "🎡", label: "Spendinglog" },
  spot: { emoji: "📍", label: "Spot" },
  travel: { emoji: "✈️", label: "Travel" },
  gamelog: { emoji: "🎮", label: "Gamelog" },
};

interface PostsGridProps {
  posts: PostMetadata[];
}

export default function PostsGrid({ posts }: PostsGridProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category") || "all";

  const handleCategoryChange = (category: string) => {
    if (category === "all") {
      router.push("/");
    } else {
      router.push(`/?category=${category}`);
    }
  };

  // Filter posts by active category
  const filteredPosts =
    activeCategory === "all"
      ? posts
      : posts.filter((post) => post.category === activeCategory);

  return (
    <>
      {/* Category Tabs */}
      <div className="mb-8 border-b">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
            <button
              key={key}
              type="button"
              onClick={() => handleCategoryChange(key)}
              className={`px-4 py-2 rounded-t-lg whitespace-nowrap transition-colors ${
                activeCategory === key
                  ? "bg-black text-white font-semibold"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {config.label} {config.emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Posts Grid */}
      {posts.length === 0 ? (
        <p className="text-gray-500">아직 포스트가 없습니다.</p>
      ) : filteredPosts.length === 0 ? (
        <p className="text-gray-500">이 카테고리에 포스트가 없습니다.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => {
            const config = CATEGORY_CONFIG[post.category || "all"] || {
              emoji: "📝",
            };

            return (
              <Link
                key={post.slug}
                href={`/posts/${post.slug}`}
                className="group"
              >
                <article className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Thumbnail */}
                  {post.thumbnail ? (
                    <div className="relative w-full h-48 bg-gray-100">
                      <Image
                        src={post.thumbnail}
                        alt={post.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <span className="text-4xl">{config.emoji}</span>
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-600 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {post.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <time>{post.date}</time>
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex gap-1">
                          {post.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="bg-gray-100 px-2 py-1 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}

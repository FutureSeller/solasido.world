import type { Metadata } from "next";
import { Suspense } from "react";
import { getAllPosts } from "@/lib/mdx";
import PostsGrid from "./components/PostsGrid";

export const metadata: Metadata = {
  title: "SOLASIDO.LOG",
  description: "일상, 소비, 여행, 게임 기록 블로그",
};

export default function Home() {
  const posts = getAllPosts();

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="border-b sticky top-0 bg-white z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold">SOLASIDO.LOG</h1>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <Suspense fallback={<div>Loading...</div>}>
          <PostsGrid posts={posts} />
        </Suspense>
      </div>
    </main>
  );
}

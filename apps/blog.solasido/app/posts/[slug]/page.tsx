import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import { getAllPostsFromD1, getPostBySlugFromD1 } from "@/lib/db";
import styles from "./loading.module.css";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlugFromD1(slug);

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  return {
    title: `${post.title} | SOLASIDO.LOG`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.created_at,
      tags: post.tags,
      images: post.thumbnail ? [post.thumbnail] : [],
    },
  };
}

// Custom components for ReactMarkdown
const markdownComponents: Components = {
  img: ({ src, alt }) => {
    if (!src) return null;

    return (
      <span className="block relative w-full my-8">
        <span
          className={`block relative w-full h-96 rounded-lg overflow-hidden ${styles.imageLoader}`}
        >
          <Image
            src={src}
            alt={alt || ""}
            fill
            className="object-contain"
            loading="lazy"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
          />
        </span>
        {alt && (
          <span className="block text-center text-sm text-gray-500 mt-2">
            {alt}
          </span>
        )}
      </span>
    );
  },
};

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPostBySlugFromD1(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b sticky top-0 bg-white z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link href="/" className="text-2xl font-bold hover:opacity-70">
            SOLASIDO.LOG
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <article>
          {/* Header */}
          <header className="mb-12">
            {post.thumbnail && (
              <div
                className={`relative w-full h-80 mb-8 rounded-lg overflow-hidden ${styles.imageLoader}`}
              >
                <Image
                  src={post.thumbnail}
                  alt={post.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                />
              </div>
            )}
            <h1 className="text-5xl font-bold mb-4">{post.title}</h1>
            {post.description && (
              <p className="text-xl text-gray-600 mb-4">{post.description}</p>
            )}
            <div className="flex items-center gap-4 text-sm text-gray-500 border-b pb-4">
              <time>{post.date}</time>
              {post.tags && post.tags.length > 0 && (
                <div className="flex gap-2">
                  {post.tags.map((tag) => (
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
          </header>

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            <ReactMarkdown components={markdownComponents}>
              {post.content}
            </ReactMarkdown>
          </div>
        </article>
      </main>
    </div>
  );
}

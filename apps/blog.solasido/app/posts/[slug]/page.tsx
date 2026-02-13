import { toCloudflareImageUrl } from "@/lib/cloudflare-image";
import { getAllPostsFromD1, getPostBySlugFromD1 } from "@/lib/db";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import ReadingProgress from "./ReadingProgress";
import ScrollToTop from "./ScrollToTop";
import { markdownComponents, stripLeadingMetaCodeBlock } from "./markdown";

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

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPostBySlugFromD1(slug);

  if (!post) {
    notFound();
  }

  const content = stripLeadingMetaCodeBlock(post.content);

  return (
    <div className="min-h-screen">
      <ReadingProgress />
      <ScrollToTop />

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
          <header className="mb-8">
            {post.thumbnail && (
              <div className="relative w-full aspect-[16/9] mb-8 rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={toCloudflareImageUrl(post.thumbnail, {
                    quality: 75,
                    width: 1280,
                  })}
                  alt={post.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, 896px"
                />
              </div>
            )}
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              {post.title}
            </h1>
            {post.description && (
              <p className="text-base md:text-xl text-gray-600 mb-4">
                {post.description}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 border-b pb-4">
              <time>{post.date}</time>
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span key={tag} className="bg-gray-100 px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </header>

          {/* Content */}
          <div className="prose prose-lg max-w-none prose-headings:break-keep prose-p:leading-7 prose-pre:whitespace-pre-wrap prose-pre:break-words">
            <ReactMarkdown
              components={markdownComponents}
              rehypePlugins={[rehypeRaw]}
            >
              {content}
            </ReactMarkdown>
          </div>
        </article>
      </main>
    </div>
  );
}

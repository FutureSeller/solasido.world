import { Metadata, ResolvingMetadata } from 'next';
import { createClient } from '@/utils/supabase/server';
import { createDefaultClient } from '@/utils/supabase/default-client';
import { PostList } from '../_components/PostList';
import { PostDescription } from '@/components/PostDescription';
import { Profile } from '@/components/Profile';
import { getPostById } from '@/queries/get-post-by-id';
import { getProfile } from '@/queries/get-profile';
import { getPostLinks } from '@/queries/get-post-links';
import Link from 'next/link';
import { ChevronLeft } from '@/components/icons/ChevronLeft';
import { ChevronRight } from '@/components/icons/ChevronRight';
import { Home } from '@/components/icons/Home';

type Props = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateStaticParams() {
  try {
    const supabase = createDefaultClient();
    const { data: posts } = await supabase
      .from('POST')
      .select('*')
      .order('id', { ascending: false });

    return (
      posts?.map((post) => ({
        id: post.id.toString(),
      })) ?? []
    );
  } catch (e) {
    console.error(e);
    return [];
  }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const supabase = createClient();
  const post = await getPostById({ client: supabase, id: params.id });

  return {
    title: post?.title ? `${post.title} | 그냥, 여우!` : (await parent).title,
    description: post?.description || (await parent).description,
    keywords: (await parent).keywords,
    openGraph: {
      url: `https://dopamine.solasido.world/post/${params.id}`,
      title: `${post?.title || ''} | 그냥, 여우!`,
      description: post?.description || '우당탕탕 여우의 신혼 일상툰',
      images: post?.thumbnail,
      type: 'article',
    },
    twitter: {
      title: `${post?.title || ''} | 그냥, 여우!`,
      description: post?.description || '우당탕탕 여우의 신혼 일상툰',
      images: post?.thumbnail,
      card: 'summary_large_image',
    },
  };
}

export default async function PostPage({ params: { id } }: Props) {
  const supabase = createClient();
  const profile = await getProfile({ client: supabase });
  const post = await getPostById({ client: supabase, id });
  const { nextPostId, prevPostId } = await getPostLinks({
    client: supabase,
    id,
  });

  return (
    <div className="w-full max-w-3xl min-w-[240px] px-4 sm:px-8">
      <Profile profile={profile} />
      <div className="py-2 w-full">
        <PostDescription post={post} />
        <PostList post={post} />
        <div className="flex justify-between items-center border-t py-4 mt-auto">
          {prevPostId ? (
            <Link
              href={`/post/${prevPostId}`}
              className="block focus:outline-none focus:ring-1 focus:ring-amber-300 hover:text-amber-500"
              prefetch={false}
              passHref
            >
              <ChevronLeft />
            </Link>
          ) : (
            <span></span>
          )}

          <Link
            href="/"
            className="block focus:outline-none focus:ring-1 focus:ring-amber-300 hover:text-amber-500"
            prefetch={false}
            passHref
          >
            <Home />
          </Link>
          {nextPostId ? (
            <Link
              href={`/post/${nextPostId}`}
              className="block focus:outline-none focus:ring-1 focus:ring-amber-300 hover:text-amber-500"
              prefetch={false}
              passHref
            >
              <ChevronRight />
            </Link>
          ) : (
            <span></span>
          )}
        </div>
      </div>
    </div>
  );
}

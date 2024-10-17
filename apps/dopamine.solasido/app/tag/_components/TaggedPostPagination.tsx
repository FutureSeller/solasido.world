'use client';

import Link from 'next/link';
import useSupabaseBrowser from '@/utils/supabase/client';
import {
  useSuspenseInfiniteQuery,
  useSuspenseQuery,
} from '@tanstack/react-query';
import {
  GetPostByTagReturnType,
  POST_PAGE_SIZE,
  getPostsByTag,
} from '@/queries/get-posts';
import { Spinner } from '@/components/Spinner';
import { LazyImage } from '@/components/LazyLoadImage';
import { InfiniteScrollObserver } from '@/components/InfiniteScrollObserver';
import { useSearchParams } from 'next/navigation';

export const TaggedPostPagination = (props: { slug: string }) => {
  const searchParams = useSearchParams();
  const order = searchParams.get('order') ?? 'desc';
  const supabase = useSupabaseBrowser();

  const { data: topPost } = useSuspenseQuery({
    queryKey: ['top-tag-post', props.slug, order],
    queryFn: async () => {
      const { data } = await supabase
        .from('POST')
        .select('*, TAG!inner(*)')
        .eq('TAG.slug', props.slug)
        .order('id', { ascending: order === 'asc' })
        .limit(1)
        .single()
        .throwOnError();

      return data;
    },
  });

  const { data, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useSuspenseInfiniteQuery({
      queryKey: ['posts', 'tag', props.slug, order],
      queryFn: async ({ pageParam }) =>
        await getPostsByTag({
          client: supabase,
          id: pageParam,
          slug: props.slug,
          order: order,
        }),
      initialPageParam: topPost?.id,
      getNextPageParam: (lastPage: GetPostByTagReturnType) => {
        if (
          !lastPage.posts?.length ||
          lastPage.posts?.length < POST_PAGE_SIZE
        ) {
          return null;
        }

        return lastPage.id;
      },
    });

  return (
    <>
      <ul className="grid grid-cols-2 sm:grid-cols-3 gap-1 py-1">
        {data?.pages.map((page) => {
          return page.posts?.map((post) => (
            <li
              key={post.id}
              className="relative hover:brightness-75 aspect-square transition-all duration-300 bg-gray-600"
            >
              <Link
                href={`/post/${post.id}`}
                className="absolute block focus:outline-none focus:ring-1 focus:ring-orange-300 z-10"
                scroll={false}
                prefetch={false}
                passHref
              >
                <LazyImage src={post.thumbnail} alt={post.title} />
              </Link>
            </li>
          ));
        })}
      </ul>
      {hasNextPage && (
        <InfiniteScrollObserver onIntersect={fetchNextPage}>
          {isFetchingNextPage ? (
            <div className="flex justify-center items-center py-2">
              <Spinner className="w-8 h-8" />
            </div>
          ) : null}
        </InfiniteScrollObserver>
      )}
    </>
  );
};

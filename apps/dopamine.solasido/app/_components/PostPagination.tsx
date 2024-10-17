'use client';

import { InfiniteScrollObserver } from '@/components/InfiniteScrollObserver';
import { LazyImage } from '@/components/LazyLoadImage';
import { Spinner } from '@/components/Spinner';
import {
  GetPostReturnType,
  getPosts,
  POST_PAGE_SIZE,
} from '@/queries/get-posts';
import useSupabaseBrowser from '@/utils/supabase/client';
import {
  useSuspenseInfiniteQuery,
  useSuspenseQuery,
} from '@tanstack/react-query';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export const PostPagination = () => {
  const searchParams = useSearchParams();
  const order = searchParams.get('order') ?? 'desc';
  const supabase = useSupabaseBrowser();

  const { data: topPost } = useSuspenseQuery({
    queryKey: ['top-post', order],
    queryFn: async () => {
      const { data } = await supabase
        .from('POST')
        .select('id')
        .order('id', { ascending: order === 'asc' })
        .limit(1)
        .single()
        .throwOnError();

      return data;
    },
  });

  const { data, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useSuspenseInfiniteQuery({
      queryKey: ['posts', order],
      queryFn: async ({ pageParam }) =>
        await getPosts({ client: supabase, id: pageParam, order: order }),
      initialPageParam: topPost?.id,
      getNextPageParam: (lastPage: GetPostReturnType) => {
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

import { TypedSupabaseClient } from '@/types/client';

export const POST_PAGE_SIZE = 21;

export async function getPosts(params: {
  client: TypedSupabaseClient;
  order?: string;
  id?: number;
}) {
  const queryBuilder = params.client
    .from('POST')
    .select('*')
    .order('id', { ascending: params.order === 'asc' })
    .limit(POST_PAGE_SIZE)
    .throwOnError();

  const { data: posts } =
    params.order === 'asc'
      ? await queryBuilder.gte('id', params.id)
      : await queryBuilder.lte('id', params.id);

  if (!posts) {
    return {
      posts: [],
      id: null,
    };
  }

  const lastPostId =
    params.order === 'asc'
      ? Number(posts[posts?.length - 1].id) + 1
      : Number(posts[posts?.length - 1].id) - 1;

  return {
    posts,
    id: lastPostId,
  };
}

export type GetPostReturnType = Awaited<ReturnType<typeof getPosts>>;

export async function getPostsByTag(params: {
  client: TypedSupabaseClient;
  slug: string;
  id?: number;
  order?: string;
}) {
  const queryBuilder = params.client
    .from('POST')
    .select('*, TAG!inner(*)')
    .order('id', { ascending: params.order === 'asc' })
    .eq('TAG.slug', params.slug)
    .limit(POST_PAGE_SIZE)
    .throwOnError();

  const { data: posts } =
    params.order === 'asc'
      ? await queryBuilder.gte('id', params.id)
      : await queryBuilder.lte('id', params.id);

  if (!posts) {
    return {
      posts: [],
      id: null,
    };
  }

  const lastPostId =
    params.order === 'asc'
      ? Number(posts[posts?.length - 1].id) + 1
      : Number(posts[posts?.length - 1].id) - 1;

  return {
    posts,
    id: lastPostId,
  };
}

export type GetPostByTagReturnType = Awaited<ReturnType<typeof getPostsByTag>>;

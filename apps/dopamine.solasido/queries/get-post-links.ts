import { TypedSupabaseClient } from '@/types/client';

export async function getPostLinks(params: {
  client: TypedSupabaseClient;
  id: string;
}) {
  const [nextPost, prevPost] = await Promise.allSettled([
    params.client.from('POST').select().gt('id', params.id).limit(1).single(),
    params.client
      .from('POST')
      .select()
      .order('id', { ascending: false })
      .lt('id', params.id)
      .limit(1)
      .single(),
  ]);

  if (nextPost.status === 'rejected' || prevPost.status === 'rejected') {
    throw new Error('No posts found');
  }

  return {
    nextPostId: nextPost.value.data?.id ?? null,
    prevPostId: prevPost.value.data?.id ?? null,
  };
}

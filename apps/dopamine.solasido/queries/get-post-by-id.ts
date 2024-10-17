import { TypedSupabaseClient } from '@/types/client';

export async function getPostById(params: {
  client: TypedSupabaseClient;
  id: string;
}) {
  const { data: post } = await params.client
    .from('POST')
    .select('*, TAG!inner(*)')
    .eq('id', params.id)
    .single()
    .throwOnError();

  return post;
}

export type GetPostByIdReturnType = Awaited<ReturnType<typeof getPostById>>;

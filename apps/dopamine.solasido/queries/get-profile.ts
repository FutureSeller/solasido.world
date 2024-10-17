import { TypedSupabaseClient } from '@/types/client';

export async function getProfile(params: { client: TypedSupabaseClient }) {
  const { data: profile } = await params.client
    .from('PROFILE')
    .select()
    .single()
    .throwOnError();

  return profile;
}

import { Metadata, ResolvingMetadata } from 'next';
import { createClient } from '@/utils/supabase/server';
import { createDefaultClient } from '@/utils/supabase/default-client';
import { Profile } from '@/components/Profile';
import { getProfile } from '@/queries/get-profile';
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from '@tanstack/react-query';
import { TaggedPostPagination } from '../_components/TaggedPostPagination';
import { PostGridSection } from '@/components/PostGridSection';
import { PostOrderFilter } from '@/components/PostOrderFilter';

type Props = {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateStaticParams() {
  try {
    const supabase = createDefaultClient();
    const { data: tags } = await supabase.from('TAG').select();

    return (
      tags?.map((tag) => ({
        slug: tag.slug,
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
  const { data: tag } = await supabase
    .from('TAG')
    .select()
    .eq('slug', params.slug)
    .single()
    .throwOnError();

  return {
    title: tag?.name
      ? `태그 - ${tag?.name} | 그냥, 여우!`
      : (await parent).title,
    description:
      `${tag?.name} 관련 에피소드 모음` || (await parent).description,
    keywords: (await parent).keywords,
    openGraph: {
      url: `https://dopamine.solasido.world/tag/${params.slug}`,
      title: `태그 - ${tag?.name} | 그냥, 여우!`,
      description: `${tag?.name} 관련 에피소드 모음 | 우당탕탕 여우의 신혼 일상툰`,
      type: 'article',
    },
    twitter: {
      title: `태그 - ${tag?.name} | 그냥, 여우!`,
      description: `${tag?.name} 관련 에피소드 모음 | 우당탕탕 여우의 신혼 일상툰`,
    },
  };
}

export default async function TagPage({ params: { slug } }: Props) {
  const supabase = createClient();
  const queryClient = new QueryClient();
  const profile = await getProfile({ client: supabase });
  const { data: tag } = await supabase
    .from('TAG')
    .select()
    .eq('slug', slug)
    .single()
    .throwOnError();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="w-full max-w-3xl min-w-[240px] px-4 sm:px-8">
        <Profile profile={profile} />
        <div>
          <div className="flex justify-between items-center flex-wrap py-2">
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              #{tag?.name}
            </h2>
            <PostOrderFilter />
          </div>
          <PostGridSection>
            <TaggedPostPagination slug={slug} />
          </PostGridSection>
        </div>
      </div>
    </HydrationBoundary>
  );
}

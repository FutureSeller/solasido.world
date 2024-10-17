import { createClient } from '@/utils/supabase/server';
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from '@tanstack/react-query';
import { getProfile } from '@/queries/get-profile';
import { Profile } from '@/components/Profile';
import { PostGridSection } from '@/components/PostGridSection';
import { PostPagination } from './_components/PostPagination';
import { Tag } from '@/components/Tag';
import { PostOrderFilter } from '@/components/PostOrderFilter';

export const dynamic = 'force-static';

export default async function Home() {
  const supabase = createClient();
  const queryClient = new QueryClient();
  const profile = await getProfile({ client: supabase });

  const { data: tags } = await supabase
    .from('TAG')
    .select('name,slug')
    .throwOnError();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="w-full max-w-3xl min-w-[240px] px-4 sm:px-8">
        <Profile profile={profile} />
        <nav className="flex items-center h-10 sm:h-14 border-b">
          <ul className="flex gap-2 overflow-x-scroll scrollbar-hide">
            {tags?.map((tag) => (
              <li key={tag.name}>
                <Tag tag={tag} />
              </li>
            ))}
          </ul>
        </nav>
        <PostOrderFilter />
        <PostGridSection>
          <PostPagination />
        </PostGridSection>
      </div>
    </HydrationBoundary>
  );
}

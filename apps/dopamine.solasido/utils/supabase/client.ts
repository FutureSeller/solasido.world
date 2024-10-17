import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/supabase';
import { useMemo } from 'react';
import { TypedSupabaseClient } from '@/types/client';

let client: TypedSupabaseClient | undefined;

const createClient = () => {
  if (client) {
    return client;
  }

  client = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  return client;
};

function useSupabaseBrowser() {
  return useMemo(createClient, []);
}

export default useSupabaseBrowser;

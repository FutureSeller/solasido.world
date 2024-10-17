import { createClient } from "@/utils/supabase/server";
import { MetadataRoute } from "next";

export async function generateSitemaps() {
  return [{ id: 0 }];
}

export default async function sitemap({
  id,
}: {
  id: number;
}): Promise<MetadataRoute.Sitemap> {
  const start = id * 50000;
  const end = start + 50000;

  const supabase = createClient();
  const { data: posts } = await supabase
    .from("POST")
    .select(`id, updated_at, post_at`)
    .order("post_at", { ascending: false })
    .range(start, end);

  return (
    posts?.map((post) => ({
      url: `https://dopamine.solasido.world/post/${post.id}`,
      lastModified: post.updated_at,
      changeFrequency: "yearly",
      priority: 1,
    })) ?? []
  );
}

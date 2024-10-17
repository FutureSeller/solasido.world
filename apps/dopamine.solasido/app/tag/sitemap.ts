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
  const { data: tags } = await supabase.from("TAG").select().range(start, end);

  return (
    tags?.map((tag) => ({
      url: `https://dopamine.solasido.world/tag/${tag.slug}`,
      lastModified: tag.created_at,
      changeFrequency: "yearly",
      priority: 1,
    })) ?? []
  );
}

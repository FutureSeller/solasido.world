import { createClient } from '../../utils/supabase/server';

export const dynamic = 'force-static';

const MAX_URL_COUNT = 50000;

const generateSitemapLink = (url: string) =>
  `<sitemap><loc>${url}</loc></sitemap>`;

export async function GET() {
  const supabase = createClient();
  const { count } = await supabase.from('POST').select('id');
  const postXmls = count
    ? Array.from({ length: Math.ceil(count / MAX_URL_COUNT) }, (_, i) => ({
        id: i,
      }))
    : [{ id: 0 }];

  const sitemapIndexXML = `<?xml version="1.0" encoding="UTF-8"?>
    <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${generateSitemapLink('https://dopamine.solasido.world/sitemap.xml')}
      ${postXmls
        .map((xmlId) =>
          generateSitemapLink(
            `https://dopamine.solasido.world/post/sitemap/${xmlId.id}.xml`,
          ),
        )
        .join('')}
      ${generateSitemapLink(
        `https://dopamine.solasido.world/tag/sitemap/0.xml`,
      )}
    </sitemapindex>
  `;

  return new Response(sitemapIndexXML, {
    headers: { 'Content-Type': 'application/xml' },
  });
}

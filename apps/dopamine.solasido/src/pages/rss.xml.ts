import rss from '@astrojs/rss'
import { fetchPublishedPosts } from '../lib/data'
import { SITE_DESCRIPTION, SITE_NAME } from '../lib/site-meta'

export async function GET(context: { site: URL | undefined }) {
  const posts = await fetchPublishedPosts()

  return rss({
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    site: context.site,
    items: posts.map((post) => ({
      title: post.title,
      description: post.metaDescription || post.summary,
      pubDate: new Date(post.publishedAt),
      link: `/posts/${post.slug}/`,
    })),
  })
}

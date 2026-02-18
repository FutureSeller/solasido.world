import type { BlogPostWithAssets } from './types'
import {
  AUTHOR_INSTAGRAM_URL,
  AUTHOR_NAME,
  PUBLISHER_NAME,
  SITE_NAME,
  SITE_URL,
} from './site-meta'

export function buildBlogPostingStructuredData(post: BlogPostWithAssets, pageUrl: string) {
  const imageUrl = post.ogImageUrl || post.assets[0]?.r2Url

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.metaDescription || post.summary,
    datePublished: post.publishedAt,
    dateModified: post.createdAt,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': pageUrl,
    },
    url: pageUrl,
    author: {
      '@type': 'Person',
      name: AUTHOR_NAME,
      sameAs: [AUTHOR_INSTAGRAM_URL],
    },
    publisher: {
      '@type': 'Organization',
      name: PUBLISHER_NAME,
      url: SITE_URL,
    },
    inLanguage: 'ko-KR',
    image: imageUrl ? [imageUrl] : undefined,
  }
}

type CollectionPost = Pick<BlogPostWithAssets, 'slug' | 'title' | 'publishedAt'>

type CollectionPageOptions = {
  pageUrl: string
  origin: string
  posts: CollectionPost[]
  pageName?: string
  positionOffset?: number
  includeBlogParent?: boolean
}

export function buildCollectionPageStructuredData({
  pageUrl,
  origin,
  posts,
  pageName = SITE_NAME,
  positionOffset = 0,
  includeBlogParent = false,
}: CollectionPageOptions) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: pageName,
    url: pageUrl,
    isPartOf: includeBlogParent
      ? {
          '@type': 'Blog',
          name: SITE_NAME,
          url: `${origin}/`,
        }
      : undefined,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: posts.map((post, index) => ({
        '@type': 'ListItem',
        position: positionOffset + index + 1,
        url: `${origin}/posts/${post.slug}/`,
        name: post.title,
        datePublished: post.publishedAt,
      })),
    },
  }
}

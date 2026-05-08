import type { MetadataRoute } from 'next';
import { allArticles, lastReviewed, siteUrl } from '@/lib/site/content';

const staticPaths = [
  '/',
  '/calculator/',
  '/guide/',
  '/case-studies/',
  '/faq/',
  '/terms/',
  '/about/',
  '/contact/',
  '/privacy/',
  '/editorial-policy/',
  '/methodology/',
  '/data-sources/',
  '/disclaimer/',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date(lastReviewed);
  const staticUrls = staticPaths.map((path) => ({
    url: path === '/' ? `${siteUrl}/` : `${siteUrl}${path}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: path === '/' ? 1 : 0.8,
  }));

  const articleUrls = allArticles.map((article) => ({
    url: `${siteUrl}/${article.category === 'guide' ? 'guide' : 'case-studies'}/${article.slug}/`,
    lastModified: new Date(article.updatedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...staticUrls, ...articleUrls];
}

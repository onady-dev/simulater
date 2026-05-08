import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArticleTemplate } from '@/components/content/ArticleTemplate';
import { ContentLayout } from '@/components/layout/ContentLayout';
import { guideArticles, siteUrl } from '@/lib/site/content';

interface PageProps {
  params: { slug: string };
}

export function generateStaticParams() {
  return guideArticles.map((article) => ({ slug: article.slug }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const article = guideArticles.find((item) => item.slug === params.slug);
  if (!article) return {};

  return {
    title: article.title,
    description: article.description,
    alternates: {
      canonical: `${siteUrl}/guide/${article.slug}/`,
    },
    openGraph: {
      title: article.title,
      description: article.description,
      url: `${siteUrl}/guide/${article.slug}/`,
      type: 'article',
    },
  };
}

export default function GuideArticlePage({ params }: PageProps) {
  const article = guideArticles.find((item) => item.slug === params.slug);
  if (!article) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    author: {
      '@type': 'Organization',
      name: 'KLEVX',
    },
    publisher: {
      '@type': 'Organization',
      name: 'KLEVX',
      url: siteUrl,
    },
    mainEntityOfPage: `${siteUrl}/guide/${article.slug}/`,
  };

  return (
    <ContentLayout title="주거비 비교 가이드" description="매수, 전세, 월세 판단 기준" showIntro={false}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ArticleTemplate article={article} />
    </ContentLayout>
  );
}

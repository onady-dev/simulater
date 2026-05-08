import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArticleTemplate } from '@/components/content/ArticleTemplate';
import { ContentLayout } from '@/components/layout/ContentLayout';
import { caseStudyArticles, siteUrl } from '@/lib/site/content';

interface PageProps {
  params: { slug: string };
}

export function generateStaticParams() {
  return caseStudyArticles.map((article) => ({ slug: article.slug }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const article = caseStudyArticles.find((item) => item.slug === params.slug);
  if (!article) return {};

  return {
    title: article.title,
    description: article.description,
    alternates: {
      canonical: `${siteUrl}/case-studies/${article.slug}/`,
    },
    openGraph: {
      title: article.title,
      description: article.description,
      url: `${siteUrl}/case-studies/${article.slug}/`,
      type: 'article',
    },
  };
}

export default function CaseStudyArticlePage({ params }: PageProps) {
  const article = caseStudyArticles.find((item) => item.slug === params.slug);
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
    mainEntityOfPage: `${siteUrl}/case-studies/${article.slug}/`,
  };

  return (
    <ContentLayout title="주거비 비교 사례" description="상황별 비용 비교 해설" showIntro={false}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ArticleTemplate article={article} />
    </ContentLayout>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import { ContentLayout } from '@/components/layout/ContentLayout';
import { caseStudyArticles, siteUrl } from '@/lib/site/content';

export const metadata: Metadata = {
  title: '주거비 비교 사례',
  description: '전세가율, 대출금리, 초기자금, 월세 조건별 매수·전세·월세 비교 사례를 모았습니다.',
  alternates: {
    canonical: `${siteUrl}/case-studies/`,
  },
};

export default function CaseStudiesPage() {
  return (
    <ContentLayout
      title="주거비 비교 사례"
      description="상황별로 매수, 전세, 월세 판단 기준을 확인하세요"
    >
      <div className="space-y-3">
        {caseStudyArticles.map((article) => (
          <Link
            key={article.slug}
            href={`/case-studies/${article.slug}`}
            className="block rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:border-blue-200 transition-colors"
          >
            <p className="text-xs font-bold text-blue-600 mb-2">사례</p>
            <h2 className="text-base font-bold text-gray-950 leading-snug">{article.title}</h2>
            <p className="text-sm text-gray-600 leading-relaxed mt-2">{article.description}</p>
            <p className="text-xs text-gray-400 mt-3">계산 기준일 {article.calculationBaseDate}</p>
          </Link>
        ))}
      </div>
    </ContentLayout>
  );
}

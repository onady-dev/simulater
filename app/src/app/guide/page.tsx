import type { Metadata } from 'next';
import Link from 'next/link';
import { ContentLayout } from '@/components/layout/ContentLayout';
import { guideArticles, siteUrl } from '@/lib/site/content';

export const metadata: Metadata = {
  title: '매수·전세·월세 비교 가이드',
  description: '초기자금, 월 지출, 순자산, 기회비용, 대출이자, 보유 기간 기준으로 주거 선택을 비교하는 가이드입니다.',
  alternates: {
    canonical: `${siteUrl}/guide/`,
  },
};

export default function GuidePage() {
  return (
    <ContentLayout
      title="매수·전세·월세 비교 가이드"
      description="실거주 의사결정에 필요한 판단 기준을 정리했습니다"
    >
      <div className="rounded-3xl bg-white border border-gray-100 p-5 shadow-sm mb-4">
        <h2 className="text-lg font-bold text-gray-950">숫자를 어떻게 봐야 할까요?</h2>
        <p className="text-sm text-gray-600 leading-relaxed mt-2">
          KLEVX 가이드는 투자 조언이 아니라 실거주자가 주거 선택을 비교할 때 필요한
          기준을 설명합니다. 계산기 결과를 해석하기 전에 초기자금, 월 지출, 순자산,
          기회비용, 보유 기간을 먼저 이해하는 것이 좋습니다.
        </p>
      </div>

      <div className="grid gap-3">
        {guideArticles.map((article) => (
          <Link
            key={article.slug}
            href={`/guide/${article.slug}`}
            className="block rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:border-blue-200 transition-colors"
          >
            <p className="text-xs font-bold text-blue-600 mb-2">가이드</p>
            <h2 className="text-base font-bold text-gray-950 leading-snug">{article.title}</h2>
            <p className="text-sm text-gray-600 leading-relaxed mt-2">{article.description}</p>
            <p className="text-xs text-gray-400 mt-3">계산 기준일 {article.calculationBaseDate}</p>
          </Link>
        ))}
      </div>
    </ContentLayout>
  );
}

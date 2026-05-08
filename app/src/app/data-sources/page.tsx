import type { Metadata } from 'next';
import { ContentLayout } from '@/components/layout/ContentLayout';
import { dataSourceRows, officialSources, siteUrl } from '@/lib/site/content';

export const metadata: Metadata = {
  title: '데이터 출처와 계산 기준',
  description: 'KLEVX 계산기에 사용되는 세금, 대출, 보증보험, 기회비용 기준과 공식 출처를 정리했습니다.',
  alternates: { canonical: `${siteUrl}/data-sources/` },
};

export default function DataSourcesPage() {
  return (
    <ContentLayout title="데이터 출처와 계산 기준" description="계산 항목별 기준값과 출처" showIntro={false}>
      <section className="rounded-3xl bg-white border border-gray-100 p-5 shadow-sm mb-4">
        <h1 className="text-2xl font-bold text-gray-950">데이터 출처와 계산 기준</h1>
        <p className="text-sm text-gray-600 leading-relaxed mt-3">
          KLEVX는 공식 출처와 사용자가 직접 입력한 가정을 구분합니다. 변경 가능성이 높은
          세금, 대출, 보증보험 항목은 최신 기준 확인이 필요합니다.
        </p>
        <p className="text-xs text-gray-400 mt-4">최근 확인일: 2026-05-08</p>
      </section>

      <div className="space-y-3">
        {dataSourceRows.map((row) => (
          <section key={row.item} className="rounded-2xl bg-white border border-gray-100 p-4 shadow-sm">
            <h2 className="text-base font-bold text-gray-950">{row.item}</h2>
            <dl className="grid grid-cols-2 gap-2 mt-3 text-xs">
              <div className="rounded-xl bg-gray-50 p-3">
                <dt className="font-semibold text-gray-400">사용 위치</dt>
                <dd className="text-gray-700 mt-1">{row.usage}</dd>
              </div>
              <div className="rounded-xl bg-gray-50 p-3">
                <dt className="font-semibold text-gray-400">기준값</dt>
                <dd className="text-gray-700 mt-1">{row.baseline}</dd>
              </div>
              <div className="rounded-xl bg-gray-50 p-3">
                <dt className="font-semibold text-gray-400">출처</dt>
                <dd className="text-gray-700 mt-1">{row.source}</dd>
              </div>
              <div className="rounded-xl bg-gray-50 p-3">
                <dt className="font-semibold text-gray-400">최종 확인일</dt>
                <dd className="text-gray-700 mt-1">{row.reviewedAt}</dd>
              </div>
              <div className="rounded-xl bg-gray-50 p-3">
                <dt className="font-semibold text-gray-400">변경 가능성</dt>
                <dd className="text-gray-700 mt-1">{row.volatility}</dd>
              </div>
              <div className="rounded-xl bg-gray-50 p-3">
                <dt className="font-semibold text-gray-400">사용자 입력 여부</dt>
                <dd className="text-gray-700 mt-1">{row.userInput}</dd>
              </div>
            </dl>
          </section>
        ))}
      </div>

      <section className="rounded-3xl bg-white border border-gray-100 p-5 shadow-sm mt-4">
        <h2 className="text-lg font-bold text-gray-950">우선 확인하는 공식 출처</h2>
        <ul className="mt-3 space-y-2">
          {officialSources.map((source) => (
            <li key={source.url}>
              <a href={source.url} target="_blank" rel="noreferrer" className="text-sm text-blue-600 underline">
                {source.label}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </ContentLayout>
  );
}

import Link from 'next/link';
import type { ArticleMeta } from '@/lib/site/content';

const categoryLabel = {
  guide: '가이드',
  'case-study': '사례',
};

function MetaPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-gray-50 px-3 py-2">
      <p className="text-[11px] font-semibold text-gray-400">{label}</p>
      <p className="text-xs font-medium text-gray-700 mt-0.5">{value}</p>
    </div>
  );
}

function InfoList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4">
      <h3 className="text-sm font-bold text-gray-900 mb-3">{title}</h3>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-sm text-gray-600 leading-relaxed">
            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-400 flex-shrink-0" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ArticleTemplate({ article }: { article: ArticleMeta }) {
  return (
    <article className="space-y-6">
      <div className="rounded-3xl bg-white border border-gray-100 shadow-sm p-5">
        <p className="text-xs font-bold text-blue-600 mb-2">{categoryLabel[article.category]}</p>
        <h1 className="text-2xl font-bold text-gray-950 leading-tight">{article.title}</h1>
        <p className="text-sm text-gray-600 leading-relaxed mt-3">{article.summary}</p>

        <div className="grid grid-cols-2 gap-2 mt-5">
          <MetaPill label="작성일" value={article.publishedAt} />
          <MetaPill label="업데이트" value={article.updatedAt} />
          <MetaPill label="계산 기준일" value={article.calculationBaseDate} />
          <MetaPill label="용도" value="실거주 비용 비교" />
        </div>
      </div>

      <div className="rounded-2xl bg-amber-50 border border-amber-100 px-4 py-3 text-sm text-amber-900 leading-relaxed">
        본문은 공개 기준과 입력 가정에 따른 참고용 설명입니다. 실제 세금, 대출, 계약 조건은
        개인 상황과 최신 제도에 따라 달라질 수 있습니다.
      </div>

      {article.sections.map((section) => (
        <section key={section.heading} className="rounded-3xl bg-white border border-gray-100 p-5 shadow-sm">
          <h2 className="text-lg font-bold text-gray-950">{section.heading}</h2>
          <div className="mt-3 space-y-3 text-sm text-gray-700 leading-relaxed">
            {section.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </section>
      ))}

      {article.calculatorPreset && (
        <div className="rounded-3xl bg-gradient-to-br from-blue-500 to-purple-600 p-5 text-white">
          <h2 className="text-base font-bold">이 조건으로 직접 비교하기</h2>
          <p className="text-sm text-white/85 mt-2 leading-relaxed">{article.calculatorPreset}</p>
          <Link
            href="/calculator"
            className="inline-flex mt-4 rounded-xl bg-white px-4 py-2 text-sm font-bold text-blue-600"
          >
            계산기로 이동
          </Link>
        </div>
      )}

      <div className="grid gap-3">
        <InfoList title="계산에 반영되는 주요 항목" items={article.reflectedItems} />
        <InfoList title="별도로 확인해야 하는 항목" items={article.excludedItems} />
      </div>

      <section className="rounded-3xl bg-white border border-gray-100 p-5 shadow-sm">
        <h2 className="text-base font-bold text-gray-950">참고 출처</h2>
        <ul className="mt-3 space-y-2">
          {article.sources.map((source) => (
            <li key={source.url}>
              <a
                href={source.url}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-blue-600 underline underline-offset-2"
              >
                {source.label}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}

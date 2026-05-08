import Link from 'next/link';
import { lastReviewed } from '@/lib/site/content';

export type TrustSection = {
  title: string;
  body: string[];
};

export function TrustPageTemplate({
  eyebrow,
  title,
  description,
  sections,
}: {
  eyebrow: string;
  title: string;
  description: string;
  sections: TrustSection[];
}) {
  return (
    <div className="space-y-4">
      <section className="rounded-3xl bg-white border border-gray-100 p-5 shadow-sm">
        <p className="text-xs font-bold text-blue-600 mb-2">{eyebrow}</p>
        <h1 className="text-2xl font-bold text-gray-950">{title}</h1>
        <p className="text-sm text-gray-600 leading-relaxed mt-3">{description}</p>
        <p className="text-xs text-gray-400 mt-4">최근 업데이트: {lastReviewed}</p>
      </section>

      {sections.map((section) => (
        <section key={section.title} className="rounded-3xl bg-white border border-gray-100 p-5 shadow-sm">
          <h2 className="text-lg font-bold text-gray-950">{section.title}</h2>
          <div className="mt-3 space-y-3 text-sm text-gray-700 leading-relaxed">
            {section.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </section>
      ))}

      <section className="rounded-3xl bg-gray-900 p-5 text-white">
        <h2 className="text-base font-bold">계산 결과는 참고용입니다</h2>
        <p className="text-sm text-white/75 mt-2 leading-relaxed">
          KLEVX는 공개 기준과 사용자가 입력한 가정으로 주거비를 비교합니다. 실제 거래,
          세금, 대출 가능 여부는 개인 상황과 최신 제도에 따라 달라질 수 있습니다.
        </p>
        <div className="flex flex-wrap gap-2 mt-4">
          <Link href="/methodology" className="rounded-xl bg-white/10 px-3 py-2 text-xs font-bold">
            계산 방식
          </Link>
          <Link href="/data-sources" className="rounded-xl bg-white/10 px-3 py-2 text-xs font-bold">
            데이터 출처
          </Link>
          <Link href="/calculator" className="rounded-xl bg-white px-3 py-2 text-xs font-bold text-gray-900">
            계산기 사용
          </Link>
        </div>
      </section>
    </div>
  );
}

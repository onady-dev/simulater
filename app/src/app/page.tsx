import type { Metadata } from 'next';
import Link from 'next/link';
import { caseStudyArticles, guideArticles, lastReviewed, siteUrl } from '@/lib/site/content';

export const metadata: Metadata = {
  title: 'KLEVX - 매수·전세·월세 주거비 비교 계산기',
  description: '매수, 전세, 월세를 초기자금, 월 지출, 순자산 관점에서 비교하는 실거주자용 주거비 계산기와 가이드.',
  alternates: {
    canonical: siteUrl,
  },
};

const pillars = [
  {
    title: '초기자금',
    body: '매수 자기자본, 취득세, 전세 보증금, 월세 보증금처럼 시작할 때 필요한 돈을 먼저 확인합니다.',
  },
  {
    title: '월 지출',
    body: '대출 원리금, 전세대출 이자, 월세가 월 추가 저축 가능액 안에 들어오는지 비교합니다.',
  },
  {
    title: '순자산',
    body: '집값 변화, 대출 잔액, 남는 현금의 운용을 반영해 몇 년 뒤 남는 자산을 봅니다.',
  },
];

const trustLinks = [
  { href: '/methodology', label: '계산 방식' },
  { href: '/data-sources', label: '데이터 출처' },
  { href: '/editorial-policy', label: '편집 정책' },
  { href: '/disclaimer', label: '면책 고지' },
];

export default function HomePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'KLEVX',
    url: siteUrl,
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web',
    description:
      '매수, 전세, 월세를 초기자금, 월 지출, 순자산 관점에서 비교하는 주거비 계산기입니다.',
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <Link href="/" className="text-lg font-bold text-gray-950">
            KLEVX
          </Link>
          <nav className="hidden sm:flex items-center gap-4 text-sm text-gray-500">
            <Link href="/guide" className="hover:text-blue-600">가이드</Link>
            <Link href="/case-studies" className="hover:text-blue-600">사례</Link>
            <Link href="/methodology" className="hover:text-blue-600">계산 방식</Link>
            <Link href="/about" className="hover:text-blue-600">소개</Link>
          </nav>
          <Link href="/calculator" className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white">
            계산하기
          </Link>
        </div>
      </header>

      <main>
        <section className="bg-gray-950 text-white">
          <div className="max-w-5xl mx-auto px-4 py-14">
            <p className="text-xs font-bold text-blue-300 mb-3">매수·전세·월세 주거비 비교</p>
            <h1 className="max-w-3xl text-3xl sm:text-5xl font-bold leading-tight">
              집을 살지, 전세로 갈지, 월세를 유지할지 숫자로 비교하세요.
            </h1>
            <p className="max-w-2xl text-sm sm:text-base text-gray-300 leading-relaxed mt-5">
              KLEVX는 실거주자를 위해 초기자금, 월 지출, 순자산 변화를 같은 기준으로
              비교합니다. 투자 수익을 보장하지 않고, 의사결정에 필요한 비용 구조를
              투명하게 보여주는 데 집중합니다.
            </p>
            <div className="flex flex-wrap gap-3 mt-7">
              <Link href="/calculator" className="rounded-xl bg-blue-500 px-5 py-3 text-sm font-bold text-white">
                계산기로 비교하기
              </Link>
              <Link href="/guide" className="rounded-xl bg-white/10 px-5 py-3 text-sm font-bold text-white">
                가이드 읽기
              </Link>
            </div>
            <p className="text-xs text-gray-400 mt-5">계산 기준 최종 확인일: {lastReviewed}</p>
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-4 py-8">
          <div className="grid sm:grid-cols-3 gap-3">
            {pillars.map((item) => (
              <div key={item.title} className="rounded-2xl bg-white border border-gray-100 p-5 shadow-sm">
                <h2 className="text-base font-bold text-gray-950">{item.title}</h2>
                <p className="text-sm text-gray-600 leading-relaxed mt-2">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-end justify-between gap-4 mb-4">
            <div>
              <p className="text-xs font-bold text-blue-600">GUIDE</p>
              <h2 className="text-xl font-bold text-gray-950 mt-1">먼저 읽어볼 가이드</h2>
            </div>
            <Link href="/guide" className="text-sm font-bold text-blue-600">전체 보기</Link>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {guideArticles.slice(0, 4).map((article) => (
              <Link
                key={article.slug}
                href={`/guide/${article.slug}`}
                className="rounded-2xl bg-white border border-gray-100 p-5 shadow-sm hover:border-blue-200 transition-colors"
              >
                <h3 className="text-base font-bold text-gray-950 leading-snug">{article.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed mt-2">{article.description}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-4 py-8">
          <div className="flex items-end justify-between gap-4 mb-4">
            <div>
              <p className="text-xs font-bold text-purple-600">CASE STUDY</p>
              <h2 className="text-xl font-bold text-gray-950 mt-1">상황별 비교 사례</h2>
            </div>
            <Link href="/case-studies" className="text-sm font-bold text-blue-600">전체 보기</Link>
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            {caseStudyArticles.slice(0, 3).map((article) => (
              <Link
                key={article.slug}
                href={`/case-studies/${article.slug}`}
                className="rounded-2xl bg-white border border-gray-100 p-5 shadow-sm hover:border-blue-200 transition-colors"
              >
                <h3 className="text-base font-bold text-gray-950 leading-snug">{article.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed mt-2">{article.description}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-4 py-4">
          <div className="rounded-3xl bg-white border border-gray-100 p-6 shadow-sm">
            <p className="text-xs font-bold text-blue-600">TRUST</p>
            <h2 className="text-xl font-bold text-gray-950 mt-1">계산 기준과 한계를 함께 공개합니다</h2>
            <p className="text-sm text-gray-600 leading-relaxed mt-3">
              KLEVX는 세금, 대출, 보증보험, 기회비용 가정을 구분해 설명합니다. 계산에
              반영된 항목과 반영되지 않은 항목을 확인한 뒤 결과를 해석하세요.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-5">
              {trustLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-xl bg-gray-50 px-4 py-3 text-center text-sm font-bold text-gray-700 hover:bg-blue-50"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="mt-8 border-t border-gray-100 bg-white py-8 text-center text-xs text-gray-400">
        <nav className="flex flex-wrap justify-center gap-x-4 gap-y-2 px-4 mb-3">
          <Link href="/calculator">계산기</Link>
          <Link href="/guide">가이드</Link>
          <Link href="/case-studies">사례</Link>
          <Link href="/privacy">개인정보</Link>
          <Link href="/contact">문의</Link>
        </nav>
        <p>© 2026 KLEVX. 본 계산기는 참고용이며 법적 효력이 없습니다.</p>
      </footer>
    </div>
  );
}
